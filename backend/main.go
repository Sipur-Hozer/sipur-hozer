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
	fullName string `json:"fullName"`
	phone    string `json:"phone"`
	password string `json:"password"`
	role     string `json:"role"`
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
	var user User
	result := db.Where("phone = ?", phone).First(&user)
	if result.Error != nil {
		return false, ""
	}
	if !checkPasswordHash(password, user.Password) {
		return false, "פרטים שגויים"
	}
	return true, user.role
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
	r.POST("/AddUser", func(c *gin.Context) {
		var req AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "נתונים לא תקינים"})
			return
		}		

	}
	return r
}

func main() {
	r := setupRouter()
	r.Run(":8080")
}