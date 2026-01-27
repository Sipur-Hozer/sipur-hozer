package handlers

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"

	"my-backend/domain"
)

func ValidateSessionHandler(db domain.Registry, c *gin.Context) {
	session := sessions.Default(c)
	userPhone := session.Get("phone")

	if userPhone == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"isLoggedIn": false})
		return
	}

	user, err := db.Users().GetByPhone(userPhone.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"isLoggedIn": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"isLoggedIn": true,
		"role":       user.Role,
		"name":       user.FullName,
	})

	return
}
