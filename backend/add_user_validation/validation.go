package add_user_validation

import (
	"net/http"
	"unicode"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"my-backend/models"
)

func AddUserValidation(c *gin.Context, req *models.AddUserRequest, db *gorm.DB) bool{	
	// Check if the user name contains letters only
	for _, ch := range req.FullName {
		if !unicode.IsLetter(ch) && ch != ' ' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "על שם העובד להכיל אותיות בלבד"})
			return false
		}
	}
	
	// Check if the user's phone number contains digits only
	for _, ch := range req.Phone {
		if !unicode.IsDigit(ch) && ch != ' ' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "על מספר טלפון להכיל ספרות בלבד"})
			return false
		}
	}

	// Check if the user name contains 10 digits
	if len(req.Phone) != 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "על מספר טלפון להכיל 10 ספרות בדיוק"})
		return false
	}

	// Check if user already exists
	var existingUser models.AddUserRequest
	result := db.Where("phone = ?", req.Phone).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "משתמש עם מספר טלפון זה כבר קיים"})
		return false
	}
	return true
}
	