package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"time"
	"fmt"
    "github.com/gin-contrib/sessions"
    "github.com/gin-contrib/sessions/cookie"
)

// --- Structs ---

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

type ShiftRequest struct {
	gorm.Model
	Phone    	string `json:"phone"`
	Role     	string `json:"role"`
	InStore  	bool   `json:"inStore"`
	EnterShift  string `json:"enterShift"`
	ExitShift 	string `json:"exitShift"`
	Extra	  	string `json:"extra"`
}


// --- Helper Functions ---

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

var db *gorm.DB

// authenticateUser verifies the phone and password against the database
func authenticateUser(phone, password string) (bool, string) {
	var user AddUserRequest
	result := db.Where("phone = ?", phone).First(&user)
	if result.Error != nil {
		return false, ""
	}
	if !checkPasswordHash(password, user.Password) {
		return false, "Invalid credentials"
	}
	return true, user.Role
}

// --- Database Initialization ---

func initDB() {
	// 1. Try to load .env file.
	// Note: In Docker, variables are often injected directly via 'env_file',
	// so it's okay if this fails to find a physical file.
	_ = godotenv.Load()               // Try current directory
	_ = godotenv.Load("../deploy/.env") // Try relative path as fallback

	dsn := os.Getenv("DATABASE_URL")
	initialAdminPhone := os.Getenv("INITIAL_ADMIN_PHONE")
	initialAdminPass := os.Getenv("INITIAL_ADMIN_PASSWORD")

	var err error

	// 2. Connect to Database
	// CRITICAL: 'PrepareStmt: false' is required when using Supabase Transaction Pooler (port 6543).
	// Without this, you will get "prepared statement already exists" errors.
	db, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, 
	}), &gorm.Config{
		PrepareStmt: false, 
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 3. Auto Migrate Schema
	db.AutoMigrate(&AddUserRequest{}, &ShiftRequest{})

	// 4. Seed Initial Admin (only if environment variables exist)
	if initialAdminPhone != "" && initialAdminPass != "" {
		var adminCount int64
		// Check if the admin already exists to prevent duplicate creation
		db.Model(&AddUserRequest{}).Where("phone = ?", initialAdminPhone).Count(&adminCount)

		if adminCount == 0 {
			log.Println("Seeding Master Admin user...")
			hashedPassword, _ := hashPassword(initialAdminPass)

			admin := AddUserRequest{
				Phone:    initialAdminPhone,
				Password: hashedPassword,
				Role:     "admin",
				FullName: "Master Admin",
			}

			if err := db.Create(&admin).Error; err != nil {
				log.Printf("Error creating admin user: %v\n", err)
			} else {
				log.Println("SUCCESS: Master Admin created successfully.")
			}
		}
	} else {
		log.Println("Info: Skipping admin seeding (Environment variables not set).")
	}
}

// --- Router Setup ---

func setupRouter() *gin.Engine {
	
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
	// 	var req LoginRequest
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
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		isAuthenticated, role := authenticateUser(req.Phone, req.Password)

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
		var req AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if(!addUserValidation(&req, db)){
			return
		}	

		newUser := AddUserRequest{
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
	
		newShift := ShiftRequest{
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
	
		var shift ShiftRequest
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
	
		var shift ShiftRequest
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

// --- Main Entry Point ---

func main() {
	initDB()
	r := setupRouter()
	r.Run(":8080")
}