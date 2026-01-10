package Initialization

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"

	"my-backend/domain" // Import the interface
	"my-backend/models"
	"my-backend/add_user_validation"
)


// SetupRouter accepts the Interface
func SetupRouter(db domain.Registry) *gin.Engine {

	r := gin.Default()

	store := cookie.NewStore([]byte("secret_key_for_session_12345"))
	r.Use(sessions.Sessions("mysession", store))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://frontend-service-413114889880.us-central1.run.app"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Login Route
	r.POST("/login", func(c *gin.Context) {
		var req models.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		user, err := db.Users().GetByPhone(req.Phone)
		if err != nil || !checkPasswordHash(req.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid phone or password"})
			return
		}

		session := sessions.Default(c)
		session.Set("phone", req.Phone)
		if err := session.Save(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"role":    user.Role,
		})
	})

	// Create User Route
	r.POST("/create-user", func(c *gin.Context) {
		var req models.AddUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if !add_user_validation.AddUserValidation(c, &req, db) { return }

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

		if err := db.Users().Create(&newUser); err != nil {
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

		if err := db.Shifts().Create(&newShift); err != nil {
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

		shift, err := db.Shifts().GetOpenShift(userPhone.(string))
		if err != nil {
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

		db.Shifts().Update(shift)
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
			Role string `json:"role"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		shift, err := db.Shifts().GetOpenShift(userPhone.(string))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No open shift found"})
			return
		}

		shift.ExitShift = time.Now().Format("02/01/2006 15:04:05")
		shift.Role = input.Role
		shift.InStore = false
		shift.Extra = "בוצע תפקיד ללא דיווח נוסף"

		db.Shifts().Update(shift)
		c.JSON(http.StatusOK, gin.H{"message": "Outside shift ended"})
	})

	// Export Shifts Route
	r.GET("/export-shifts", func(c *gin.Context) {
		results, err := db.Shifts().GetForExport()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch shifts data"})
			return
		}

		f := excelize.NewFile()
		defer f.Close()

		sheetName := "Shifts"
		index, _ := f.NewSheet(sheetName)
		f.SetActiveSheet(index)
		f.DeleteSheet("Sheet1")

		headers := []string{"שם מלא", "טלפון", "תפקיד", "מיקום", "זמן כניסה", "זמן יציאה", "הערות/דיווח"}
		for i, header := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			f.SetCellValue(sheetName, cell, header)
		}

		for i, row := range results {
			location := "חנות"
			if !row.InStore {
				location = "חוץ"
			}
			rowIdx := i + 2
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowIdx), row.FullName)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowIdx), row.Phone)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowIdx), row.Role)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowIdx), location)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowIdx), row.EnterShift)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowIdx), row.ExitShift)
			f.SetCellValue(sheetName, fmt.Sprintf("G%d", rowIdx), row.Extra)
		}

		c.Header("Content-Disposition", "attachment; filename=shifts_report.xlsx")
		c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		f.Write(c.Writer)
	})

	// Export Users Route
	r.GET("/export-users", func(c *gin.Context) {
		users, err := db.Users().GetAll()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users data"})
			return
		}

		f := excelize.NewFile()
		defer f.Close()

		sheetName := "Users"
		index, _ := f.NewSheet(sheetName)
		f.SetActiveSheet(index)
		f.DeleteSheet("Sheet1")

		headers := []string{"שם מלא", "טלפון", "תפקיד"}
		for i, header := range headers {
			cell, _ := excelize.CoordinatesToCellName(i+1, 1)
			f.SetCellValue(sheetName, cell, header)
		}

		for i, user := range users {
			rowIdx := i + 2
			f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowIdx), user.FullName)
			f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowIdx), user.Phone)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowIdx), user.Role)
		}

		c.Header("Content-Disposition", "attachment; filename=users_report.xlsx")
		c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		f.Write(c.Writer)
	})

	return r
}