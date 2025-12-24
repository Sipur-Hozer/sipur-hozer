package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// This function runs once before all tests
// It connects to the DB so the global 'db' variable is ready
func TestMain(m *testing.M) {
	// 1. Initialize DB connection
	// Ensure your .env file is accessible to the test runner!
	initDB() 
	
	// 2. Run the tests
	exitVal := m.Run()

	// 3. Exit
	os.Exit(exitVal)
}

// Helper function to create a temporary user for testing
func createTestUser(phone, plainPassword, role string) {
	hashed, _ := hashPassword(plainPassword)
	user := AddUserRequest{
		Phone:    phone,
		Password: hashed, // IMPORTANT: Save hashed password, not plain text
		Role:     role,
		FullName: "Test User",
	}
	db.Create(&user)
}

// Helper function to delete the temporary user
func deleteTestUser(phone string) {
	// Unscoped() uses a hard delete (removes the row entirely)
	db.Unscoped().Where("phone = ?", phone).Delete(&AddUserRequest{})
}

// 1. INTEGRATION TEST: Logic Check (Real DB)
func TestAuthenticateUser(t *testing.T) {
	// Setup: Create a real user in the DB
	testPhone := "0559999999"
	testPass := "secret123"
	testRole := "employee"
	
	createTestUser(testPhone, testPass, testRole)
	// Teardown: Delete user when test finishes
	defer deleteTestUser(testPhone)

	// Test Cases
	tests := []struct {
		name     string
		phone    string
		password string
		wantAuth bool
		wantRole string
	}{
		{"Valid Login", testPhone, testPass, true, testRole},
		{"Wrong Password", testPhone, "wrongpass", false, ""},
		{"Non-existent User", "000000000", "1234", false, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotAuth, gotRole := authenticateUser(tt.phone, tt.password)
			assert.Equal(t, tt.wantAuth, gotAuth)
			if tt.wantAuth {
				assert.Equal(t, tt.wantRole, gotRole)
			}
		})
	}
}

// 2. API TEST: Login Route
func TestLoginRoute(t *testing.T) {
	// Setup Gin and DB User
	gin.SetMode(gin.TestMode)
	router := setupRouter()

	testPhone := "0558888888"
	testPass := "apitest123"
	createTestUser(testPhone, testPass, "manager")
	defer deleteTestUser(testPhone)

	// Case A: Successful Login
	t.Run("API Success", func(t *testing.T) {
		loginData := LoginRequest{Phone: testPhone, Password: testPass}
		jsonData, _ := json.Marshal(loginData)

		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "manager")
		assert.Contains(t, w.Body.String(), "token") // If you implement JWT later
	})

	// Case B: Failed Login (Wrong Password)
	t.Run("API Wrong Password", func(t *testing.T) {
		loginData := LoginRequest{Phone: testPhone, Password: "wrong"}
		jsonData, _ := json.Marshal(loginData)

		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}