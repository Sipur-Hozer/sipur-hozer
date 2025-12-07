package main

import (
	"net/http"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// return: (isSuccess bool, role string)
func authenticateUser(phone, password string) (bool, string) {
	
	if phone == "1111" && password == "1111" {
		return true, "manager"
	}

	if phone == "0505656888" && password == "1234" {
		return true, "employee"
	}

	return false, ""
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
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

	r.Run(":8080")
}