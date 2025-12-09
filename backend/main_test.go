package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert" // We will use this library for easier assertions
)

// 1. UNIT TEST: Check the logic function directly
func TestAuthenticateUser(t *testing.T) {
	// Table-Driven Test
	tests := []struct {
		name     string
		phone    string
		password string
		wantAuth bool
		wantRole string
	}{
		{"Manager Login", "1111", "1111", true, "manager"},
		{"Employee Login", "0505656888", "1234", true, "employee"},
		{"Wrong Password", "1111", "wrong", false, ""},
		{"Unknown User", "99999", "1111", false, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotAuth, gotRole := authenticateUser(tt.phone, tt.password)
			if gotAuth != tt.wantAuth {
				t.Errorf("authenticateUser() auth = %v, want %v", gotAuth, tt.wantAuth)
			}
			if gotRole != tt.wantRole {
				t.Errorf("authenticateUser() role = %v, want %v", gotRole, tt.wantRole)
			}
		})
	}
}

// 2. INTEGRATION TEST: Check the API Endpoint
func TestLoginRoute(t *testing.T) {
	// Setup the router (using the function we extracted)
	gin.SetMode(gin.TestMode)
	router := setupRouter()

	// Case A: Successful Login
	t.Run("API Success", func(t *testing.T) {
		// Create a JSON body
		loginData := LoginRequest{Phone: "1111", Password: "1111"}
		jsonData, _ := json.Marshal(loginData)

		// Create a fake HTTP request
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		
		// Create a fake Response Recorder
		w := httptest.NewRecorder()

		// Perform the request
		router.ServeHTTP(w, req)

		// Check results
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "manager")
	})

	// Case B: Failed Login
	t.Run("API Failure", func(t *testing.T) {
		loginData := LoginRequest{Phone: "0000", Password: "000"}
		jsonData, _ := json.Marshal(loginData)

		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}