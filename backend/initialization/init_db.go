package Initialization

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
	"my-backend/models"
)

// --- Helper Functions ---

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}


// --- Database Initialization ---

func InitDB(db *gorm.DB) {
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
	db.AutoMigrate(&models.AddUserRequest{}, &models.ShiftRequest{})

	// 4. Seed Initial Admin (only if environment variables exist)
	if initialAdminPhone != "" && initialAdminPass != "" {
		var adminCount int64
		// Check if the admin already exists to prevent duplicate creation
		db.Model(&models.AddUserRequest{}).Where("phone = ?", initialAdminPhone).Count(&adminCount)

		if adminCount == 0 {
			log.Println("Seeding Master Admin user...")
			hashedPassword, _ := hashPassword(initialAdminPass)

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
}