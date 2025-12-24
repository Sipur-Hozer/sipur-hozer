package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- Structs ---

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type AddUserRequest struct {
	gorm.Model
	FullName string `json:"fullName"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

// --- Helper Functions ---

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var db *gorm.DB

// authenticateUser verifies the phone and password against the database
func authenticateUser(phone, password string) (bool, string) {
	var user AddUserRequest
	result := db.Where("phone = ?", phone).First(&user)
	if result.Error != nil {
		return false, ""
	}
	if !checkPasswordHash(password, user.Password) {
		return false, "Invalid credentials"
	}
	return true, user.Role
}

// --- Database Initialization ---

func initDB() {
	// 1. Try to load .env file.
	// Note: In Docker, variables are often injected directly via 'env_file',
	// so it's okay if this fails to find a physical file.
	_ = godotenv.Load()               // Try current directory
	_ = godotenv.Load("../deploy/.env") // Try relative path as fallback

	dsn := os.Getenv("DATABASE_URL")
	initialAdminPhone := os.Getenv("INITIAL_ADMIN_PHONE")
	initialAdminPass := os.Getenv("INITIAL_ADMIN_PASSWORD")

	var err error

	// 2. Connect to Database
	// CRITICAL: 'PrepareStmt: false' is required when using Supabase Transaction Pooler (port 6543).
	// Without this, you will get "prepared statement already exists" errors.
	db, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, 
	}), &gorm.Config{
		PrepareStmt: false, 
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 3. Auto Migrate Schema
	db.AutoMigrate(&AddUserRequest{})

	// 4. Seed Initial Admin (only if environment variables exist)
	if initialAdminPhone != "" && initialAdminPass != "" {
		var adminCount int64
		// Check if the admin already exists to prevent duplicate creation
		db.Model(&AddUserRequest{}).Where("phone = ?", initialAdminPhone).Count(&adminCount)

		if adminCount == 0 {
			log.Println("Seeding Master Admin user...")
			hashedPassword, _ := hashPassword(initialAdminPass)

			admin := AddUserRequest{
				Phone:    initialAdminPhone,
				Password: hashedPassword,
				Role:     "admin",
				FullName: "Master Admin",
			}

			if err := db.Create(&admin).Error; err != nil {
				log.Printf("Error creating admin user: %v\n", err)
			} else {
				log.Println("SUCCESS: Master Admin created successfully.")
			}
		}
	} else {
		log.Println("Info: Skipping admin seeding (Environment variables not set).")
	}
}

// --- Router Setup ---

func setupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"POST", "GET", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	// Login Route
	r.POST("/login", func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		isAuthenticated, role := authenticateUser(req.Phone, req.Password)

		if isAuthenticated {
			c.JSON(http.StatusOK, gin.H{
				"message": "Login successful",
				"role":    role,
			})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid phone or password"})
		}
	})

	// Add User Route
	r.POST("/create-user", func(c *gin.Context) {
		var req AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		hashedPassword, err := hashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
			return
		}

		newUser := AddUserRequest{
			FullName: req.FullName,
			Phone:    req.Phone,
			Password: hashedPassword,
			Role:     req.Role,
		}

		result := db.Create(&newUser)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	})

	return r
}

// --- Main Entry Point ---

func main() {
	initDB()
	r := setupRouter()
	r.Run(":8080")
}