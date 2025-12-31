package Initialization

import (
	"fmt"          
	"net/http"    
	"time"
	"gorm.io/gorm"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	
	"my-backend/models"
	"my-backend/add_user_validation"

)

// authenticateUser verifies the phone and password against the database
func authenticateUser(phone, password string, db *gorm.DB) (bool, string) {
	var user models.AddUserRequest
	result := db.Where("phone = ?", phone).First(&user)
	if result.Error != nil {
		return false, ""
	}
	if !checkPasswordHash(password, user.Password) {
		return false, "Invalid credentials"
	}
	return true, user.Role
}

// --- Router Setup ---

func SetupRouter(db *gorm.DB) *gin.Engine {
	
	r := gin.Default()

	store := cookie.NewStore([]byte("secret_key_for_session_12345"))
	r.Use(sessions.Sessions("mysession", store))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// r := gin.Default()

	// // Configure CORS
	// r.Use(cors.New(cors.Config{
	// 	AllowOrigins: []string{"http://localhost:3000"},
	// 	AllowMethods: []string{"POST", "GET", "OPTIONS"},
	// 	AllowHeaders: []string{"Origin", "Content-Type"},
	// }))

	// // Login Route
	// r.POST("/login", func(c *gin.Context) {
	// 	var req models.LoginRequest
	// 	if err := c.ShouldBindJSON(&req); err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
	// 		return
	// 	}

	// 	isAuthenticated, role := authenticateUser(req.Phone, req.Password)

	// 	if isAuthenticated {
	// 		c.JSON(http.StatusOK, gin.H{
	// 			"message": "Login successful",
	// 			"role":    role,
	// 		})
	// 	} else {
	// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid phone or password"})
	// 	}
	// })

	// Login Route
	r.POST("/login", func(c *gin.Context) {
		var req models.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		isAuthenticated, role := authenticateUser(req.Phone, req.Password, db)

		if isAuthenticated {
			session := sessions.Default(c)
			
			session.Set("phone", req.Phone) 
			
			if err := session.Save(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Login successful",
				"role":    role,
			})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid phone or password"})
		}
	})

	// Add User Route
	r.POST("/create-user", func(c *gin.Context) {
		var req models.AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if(!add_user_validation.AddUserValidation(c, &req, db)){
			return
		}	

		hashedPassword, err := hashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
			return
		}
		newUser := models.AddUserRequest{
			FullName: req.FullName,
			Phone:    req.Phone,
			Password: hashedPassword,
			Role:     req.Role,
		}

		result := db.Create(&newUser)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	})

	// Start Shift Route
	r.POST("/start-shift", func(c *gin.Context) {
		session := sessions.Default(c)
		userPhone := session.Get("phone")
	
		if userPhone == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not logged in"})
			return
		}
	
		currentTime := time.Now().Format("02/01/2006 15:04:05")
	
		newShift := models.ShiftRequest{
			Phone:      userPhone.(string),
			EnterShift: currentTime,
		}
	
		if err := db.Create(&newShift).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start shift"})
			return
		}
	
		c.JSON(http.StatusOK, gin.H{"message": "Shift started", "time": currentTime})
	})

	// End Shift Inside Route
	r.POST("/end-shift-inside", func(c *gin.Context) {
		session := sessions.Default(c)
		userPhone := session.Get("phone")
		if userPhone == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not logged in"})
			return
		}
	
		var input struct {
			Role          string `json:"role"`
			BooksQuantity string `json:"booksQuantity"`
			CashDesk      string `json:"cashDesk"`
		}
	
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
	
		var shift models.ShiftRequest
		result := db.Where("phone = ? AND exit_shift = ?", userPhone.(string), "").Order("created_at desc").First(&shift)
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No open shift found"})
			return
		}

		var extraFormatted string
		switch input.Role {
		case "טיפול בהזמנות אינטרנט":
			extraFormatted = fmt.Sprintf("כמות ספרים שנמכרו: %s", input.BooksQuantity)
		
		case "קופה":
			extraFormatted = fmt.Sprintf("כמות ספרים: %s | עמלת יעד: %s", input.BooksQuantity, input.CashDesk)
		
		default:
			extraFormatted = "בוצע תפקיד ללא דיווח נוסף"
    }
	
		shift.ExitShift = time.Now().Format("02/01/2006 15:04:05")
		shift.Role = input.Role
		shift.InStore = true
		shift.Extra = extraFormatted
	
		db.Save(&shift)
		c.JSON(http.StatusOK, gin.H{"message": "Inside shift ended"})
	})

	// End Shift Outside Route
	r.POST("/end-shift-outside", func(c *gin.Context) {
		session := sessions.Default(c)
		userPhone := session.Get("phone")
		if userPhone == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not logged in"})
			return
		}
	
		var input struct {
			Role  string `json:"role"`
			Extra string `json:"extra"`
		}
	
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
	
		var shift models.ShiftRequest
		result := db.Where("phone = ? AND exit_shift = ?", userPhone.(string), "").Order("created_at desc").First(&shift)
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No open shift found"})
			return
		}

		var extraFormatted string
		switch input.Role {
		default:
			extraFormatted = "בוצע תפקיד ללא דיווח נוסף"
		
    }
	
		shift.ExitShift = time.Now().Format("02/01/2006 15:04:05")
		shift.Role = input.Role
		shift.InStore = true
		shift.Extra = extraFormatted
	
		db.Save(&shift)
		c.JSON(http.StatusOK, gin.H{"message": "Inside shift ended"})
	})


	return r
}