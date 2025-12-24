package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv" 
	"golang.org/x/crypto/bcrypt" 
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var db *gorm.DB

// Logic: Verify credentials
func authenticateUser(phone, password string) (bool, string) {
	var user AddUserRequest
	result := db.Where("phone = ?", phone).First(&user)
	if result.Error != nil {
		return false, ""
	}
	if !checkPasswordHash(password, user.Password) {
		return false, "פרטים שגויים"
	}
	return true, user.role
}

func initDB() {
	err := godotenv.Load("../deploy/.env")
	if err != nil {
		log.Println("Warning: .env file not found, assuming environment variables are set.")
	}

	dsn := os.Getenv("DATABASE_URL")
	initialAdminPhone := os.Getenv("INITIAL_ADMIN_PHONE")
	initialAdminPass := os.Getenv("INITIAL_ADMIN_PASSWORD")
	

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err == nil {
		break
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&AddUserRequest{})

	var adminCount int64
	db.Model(&AddUserRequest{}).Where("phone = ?", initialAdminPhone).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, _ := hashPassword(initialAdminPass)
		
		db.Create(&AddUserRequest{
			Phone:    initialAdminPhone,
			Password: hashedPassword, 
			Role:     "admin",
			FullName: "Master Admin",
		})
	}
}

// Setup: Configure routes
func setupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"POST", "GET", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	r.POST("/login", func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "נתונים לא תקינים"})
			return
		}

		isAuthenticated, role := authenticateUser(req.Phone, req.Password)

		if isAuthenticated {
			c.JSON(http.StatusOK, gin.H{
				"message": "התחברת בהצלחה!",
				"role":    role,
			})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "שם משתמש או סיסמה שגויים"})
		}
	})
	r.POST("/AddUser", func(c *gin.Context)) {
		var req AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "נתונים לא תקינים"})
			return
		}	
		hashedPassword, err := hashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "שגיאה ביצירת סיסמה"})
			return
		}	
		newUser := AddUserRequest{
			FullName: req.fullName,
			Phone:    req.phone,			
			Password: hashedPassword,
			Role:     req.role,
		}	
		result := db.Create(&newUser)	
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "שגיאה ביצירת משתמש"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "משתמש נוצר בהצלחה"})

	}
	return r
}

func main() {
	initDB()
	r := setupRouter()
	r.Run(":8080")
}