package Initialization

import (
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"my-backend/models"
)

// --- Helper Functions (Same as before) ---

func hashPasswordSQLite(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// --- Database Initialization ---

func InitSQLite() *gorm.DB {
	// 1. Try to load .env file (Same logic as your original file)
	_ = godotenv.Load()               // Try current directory
	_ = godotenv.Load("../deploy/.env") // Try relative path as fallback

	dbFileName := "local_database.db"
	
	initialAdminPhone := os.Getenv("INITIAL_ADMIN_PHONE")
	initialAdminPass := os.Getenv("INITIAL_ADMIN_PASSWORD")

	var db *gorm.DB
	var err error

	// 2. Connect to SQLite Database
	db, err = gorm.Open(sqlite.Open(dbFileName), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to SQLite database:", err)
	}

	// 3. Auto Migrate Schema (Same as before)
	db.AutoMigrate(&models.AddUserRequest{}, &models.ShiftRequest{})

	// 4. Seed Initial Admin (Same logic as before)
	if initialAdminPhone != "" && initialAdminPass != "" {
		var adminCount int64
		// Check if the admin already exists
		db.Model(&models.AddUserRequest{}).Where("phone = ?", initialAdminPhone).Count(&adminCount)

		if adminCount == 0 {
			log.Println("Seeding Master Admin user (SQLite)...")
			hashedPassword, _ := hashPasswordSQLite(initialAdminPass)

			admin := models.AddUserRequest{
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

	return db
}