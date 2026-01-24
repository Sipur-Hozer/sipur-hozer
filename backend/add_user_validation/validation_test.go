package add_user_validation

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"my-backend/domain"
	"my-backend/models"
)

// --- Mocks ---

// MockRegistry implements domain.Registry
type MockRegistry struct {
	MockUserStore *MockUserStore
}

func (m *MockRegistry) Users() domain.UserStore {
	return m.MockUserStore
}

// We don't need these for this specific test, but they satisfy the interface
func (m *MockRegistry) Shifts() domain.ShiftStore { return nil }
func (m *MockRegistry) WeeklyShifts() domain.WeeklyShiftStore { return nil }

// MockUserStore implements domain.UserStore
type MockUserStore struct {
	// users is a map simulating the DB: phone -> user
	users map[string]*models.AddUserRequest
}

func (m *MockUserStore) GetByPhone(phone string) (*models.AddUserRequest, error) {
	if user, exists := m.users[phone]; exists {
		return user, nil
	}
	return nil, errors.New("user not found")
}

// Unused methods for this test
func (m *MockUserStore) Create(user *models.AddUserRequest) error { return nil }
func (m *MockUserStore) GetAll() ([]models.AddUserRequest, error) { return nil, nil }

// --- Tests ---

func TestAddUserValidation(t *testing.T) {
	// 1. Setup Gin to Test Mode
	gin.SetMode(gin.TestMode)

	// 2. Define Test Cases
	tests := []struct {
		name           string
		inputUser      *models.AddUserRequest
		existingUsers  map[string]*models.AddUserRequest // Data currently in "DB"
		expectedResult bool
		expectedCode   int
		expectedBody   string
	}{
		{
			name: "Success - Valid New User",
			inputUser: &models.AddUserRequest{
				FullName: "Yoav Fuchs",
				Phone:    "0501234567",
			},
			existingUsers:  map[string]*models.AddUserRequest{},
			expectedResult: true,
			expectedCode:   200, // Validation doesn't write 200 explicitly on success, but recorder defaults to 200
			expectedBody:   "",
		},
		{
			name: "Failure - Invalid Name (Contains Digits)",
			inputUser: &models.AddUserRequest{
				FullName: "Yoav123",
				Phone:    "0501234567",
			},
			existingUsers:  map[string]*models.AddUserRequest{},
			expectedResult: false,
			expectedCode:   http.StatusBadRequest,
			expectedBody:   "על שם העובד להכיל אותיות בלבד",
		},
		{
			name: "Failure - Invalid Phone (Contains Letters)",
			inputUser: &models.AddUserRequest{
				FullName: "Yoav Fuchs",
				Phone:    "05012abcde",
			},
			existingUsers:  map[string]*models.AddUserRequest{},
			expectedResult: false,
			expectedCode:   http.StatusBadRequest,
			expectedBody:   "על מספר טלפון להכיל ספרות בלבד",
		},
		{
			name: "Failure - Invalid Phone Length (Too Short)",
			inputUser: &models.AddUserRequest{
				FullName: "Yoav Fuchs",
				Phone:    "050123",
			},
			existingUsers:  map[string]*models.AddUserRequest{},
			expectedResult: false,
			expectedCode:   http.StatusBadRequest,
			expectedBody:   "על מספר טלפון להכיל 10 ספרות בדיוק",
		},
		{
			name: "Failure - User Already Exists",
			inputUser: &models.AddUserRequest{
				FullName: "New User",
				Phone:    "0509999999",
			},
			existingUsers: map[string]*models.AddUserRequest{
				"0509999999": {FullName: "Existing User", Phone: "0509999999"},
			},
			expectedResult: false,
			expectedCode:   http.StatusConflict,
			expectedBody:   "משתמש עם מספר טלפון זה כבר קיים",
		},
	}

	// 3. Run Test Loop
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup Mock DB
			mockStore := &MockRegistry{
				MockUserStore: &MockUserStore{users: tt.existingUsers},
			}

			// Setup Gin Recorder
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			// Execute Function
			result := AddUserValidation(c, tt.inputUser, mockStore)

			// Assertions
			if result != tt.expectedResult {
				t.Errorf("expected return %v, got %v", tt.expectedResult, result)
			}

			// Check Status Code (only if validation failed)
			if !tt.expectedResult {
				if w.Code != tt.expectedCode {
					t.Errorf("expected status code %d, got %d", tt.expectedCode, w.Code)
				}

				// Check JSON Body
				var response map[string]string
				err := json.Unmarshal(w.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("failed to parse response json: %v", err)
				}
				if response["error"] != tt.expectedBody {
					t.Errorf("expected error message '%s', got '%s'", tt.expectedBody, response["error"])
				}
			}
		})
	}
}