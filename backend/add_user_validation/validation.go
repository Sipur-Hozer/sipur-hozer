package add_user_validation

import (
	"net/http"
	"unicode"

	"github.com/gin-gonic/gin"
	"my-backend/domain" // Import the interface
	"my-backend/models"
    // Notice: "gorm.io/gorm" is removed!
)

func AddUserValidation(c *gin.Context, req *models.AddUserRequest, store domain.Registry) bool {
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
	// We use the Interface method .GetByPhone()
	_, err := store.Users().GetByPhone(req.Phone)

	// If err is nil, it means the user WAS found successfully (which is a conflict here)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "משתמש עם מספר טלפון זה כבר קיים"})
		return false
	}

	return true
}