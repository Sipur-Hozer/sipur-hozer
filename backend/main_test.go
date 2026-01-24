package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	initialization "my-backend/initialization"
	"my-backend/models"
	"my-backend/storage"
)

// Global DB variable for the test file
var db *gorm.DB

func TestMain(m *testing.M) {
	// 1. Initialize DB (SQLite In-Memory)
	// Ensure this calls your SQLite init function!
	db = initialization.InitSQLite() 
	
	if db == nil {
		log.Fatal("Failed to connect to DB for testing")
	}

	// 2. Run the tests
	exitVal := m.Run()

	// 3. Exit
	os.Exit(exitVal)
}

// --- HELPERS ---

func hashPassword(password string) string {
	bytes, _ := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes)
}

func createTestUser(phone, plainPassword, role string) {
	hashed := hashPassword(plainPassword)
	user := models.AddUserRequest{
		Phone:    phone,
		Password: hashed,
		Role:     role,
		FullName: "Test User",
	}
	if err := db.Create(&user).Error; err != nil {
		log.Printf("Failed to create test user: %v", err)
	}
}

func deleteTestUser(phone string) {
	db.Unscoped().Where("phone = ?", phone).Delete(&models.AddUserRequest{})
	db.Unscoped().Where("phone = ?", phone).Delete(&models.ShiftRequest{})
}

// --- TESTS ---

// 1. LOGIN TEST
func TestLoginRoute(t *testing.T) {
	gin.SetMode(gin.TestMode)
	registry := storage.NewPostgresRegistry(db) // Works with SQLite too because it uses Gorm
	router := initialization.SetupRouter(registry)

	testPhone := "0558888888"
	testPass := "apitest123"
	
	createTestUser(testPhone, testPass, "manager")
	defer deleteTestUser(testPhone)

	t.Run("API Success", func(t *testing.T) {
		loginData := models.LoginRequest{Phone: testPhone, Password: testPass}
		jsonData, _ := json.Marshal(loginData)

		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "manager")
	})
}

// 2. SHIFT FLOW TEST (Start -> Check -> End)
func TestShiftFlow(t *testing.T) {
	gin.SetMode(gin.TestMode)
	registry := storage.NewPostgresRegistry(db)
	router := initialization.SetupRouter(registry)

	testPhone := "0501111111"
	testPass := "shift123"

	// Setup: Create User
	createTestUser(testPhone, testPass, "employee")
	defer deleteTestUser(testPhone)

	// Step A: Login to get the Session Cookie
	loginData := models.LoginRequest{Phone: testPhone, Password: testPass}
	loginJson, _ := json.Marshal(loginData)
	reqLogin, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(loginJson))
	reqLogin.Header.Set("Content-Type", "application/json")
	
	wLogin := httptest.NewRecorder()
	router.ServeHTTP(wLogin, reqLogin)
	
	// Extract the "Set-Cookie" header (Important!)
	cookie := wLogin.Result().Header.Get("Set-Cookie")
	assert.NotEmpty(t, cookie, "Login must return a session cookie")

	// Step B: Start Shift
	reqStart, _ := http.NewRequest("POST", "/start-shift", nil)
	reqStart.Header.Set("Cookie", cookie) // Send the cookie
	
	wStart := httptest.NewRecorder()
	router.ServeHTTP(wStart, reqStart)
	
	assert.Equal(t, http.StatusOK, wStart.Code)
	assert.Contains(t, wStart.Body.String(), "Shift started")

	// Step C: Check Active Shift (Should be true)
	reqCheck, _ := http.NewRequest("GET", "/check-active-shift", nil)
	reqCheck.Header.Set("Cookie", cookie)

	wCheck := httptest.NewRecorder()
	router.ServeHTTP(wCheck, reqCheck)

	assert.Equal(t, http.StatusOK, wCheck.Code)
	assert.Contains(t, wCheck.Body.String(), "true")

	// Step D: End Shift (Inside)
	endData := map[string]string{
		"role": "Seller",
		"booksQuantity": "5",
		"cashDesk": "100",
	}
	endJson, _ := json.Marshal(endData)
	reqEnd, _ := http.NewRequest("POST", "/end-shift-inside", bytes.NewBuffer(endJson))
	reqEnd.Header.Set("Content-Type", "application/json")
	reqEnd.Header.Set("Cookie", cookie)

	wEnd := httptest.NewRecorder()
	router.ServeHTTP(wEnd, reqEnd)

	assert.Equal(t, http.StatusOK, wEnd.Code)
	assert.Contains(t, wEnd.Body.String(), "Inside shift ended")

	// Step E: Try to End Shift AGAIN (Should Fail - 404)
	wFail := httptest.NewRecorder()
	// Create a new request object to avoid reusing the consumed body
	reqFail, _ := http.NewRequest("POST", "/end-shift-inside", bytes.NewBuffer(endJson))
	reqFail.Header.Set("Content-Type", "application/json")
	reqFail.Header.Set("Cookie", cookie)
	
	router.ServeHTTP(wFail, reqFail)
	assert.Equal(t, http.StatusNotFound, wFail.Code)
}