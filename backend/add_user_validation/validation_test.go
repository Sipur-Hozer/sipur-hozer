package add_user_validation

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"my-backend/models"
)

func TestAddUserValidation(t *testing.T) {
	// --- setting Gin to Test Mode ---
	gin.SetMode(gin.TestMode)

	// --- defining the Table (Table-Driven Tests) ---
	tests := []struct {
		name string                 // test name
		req  models.AddUserRequest  // input for the test
		want bool                   // the result we expect to get (true/false)
	}{
		{
			name: "Invalid Phone - Contains Letters",
			req: models.AddUserRequest{
				FullName: "ישראל ישראלי",
				Phone:    "050abcde12", // invalid phone number
			},
			want: false,
		},
		{
			name: "Invalid Phone - Too Short",
			req: models.AddUserRequest{
				FullName: "ישראל ישראלי",
				Phone:    "050", // too short
			},
			want: false,
		},
		{
			name: "Invalid Name - Contains Digits",
			req: models.AddUserRequest{
				FullName: "ישראל123", // invalid name
				Phone:    "0501234567",
			},
			want: false,
		},
		// {
		// 	name: "Valid Input",
		// 	req: models.AddUserRequest{
		// 		FullName: "ישראל ישראלי",
		// 		Phone:    "0501234567",
		// 	},
		// 	want: true,
		// },
	}

	// --- running the tests ---
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// creating a fake Gin Context
			// the Recorder is used to "capture" the response that the function writes (e.g., an error message)
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			got := AddUserValidation(c, &tt.req, nil)

			if got != tt.want {
				t.Errorf("AddUserValidation() = %v, want %v", got, tt.want)
			}
            
            if !tt.want && w.Code != 400 {
                t.Errorf("Expected HTTP 400 Bad Request, got %d", w.Code)
            }
		})
	}
}