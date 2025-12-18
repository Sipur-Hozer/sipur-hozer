package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Phone    string `json:"phone" gorm:"unique"`
	Password string `json:"password"`
	Role     string `json:"role"`
	FullName string `json:"fullName"`
}

var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("sipur_hozer.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	db.AutoMigrate(&User{})

	var adminCount int64
	db.Model(&User{}).Where("phone = ?", "9999999999").Count(&adminCount)
	if adminCount == 0 {
		db.Create(&User{
			Phone:    "9999999999",
			Password: "admin",
			Role:     "manager",
			FullName: "Master Admin",
		})
		log.Println("Created initial manager user")
	}
}

func createUserHandler(c *gin.Context) {
	var newUser User
	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "נתונים לא תקינים"})
		return
	}

	result := db.Create(&newUser)
	if result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "משתמש קיים או שגיאה בשרת"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "נוצר בהצלחה", "user": newUser})
}

func getAllUsersHandler(c *gin.Context) {
	var users []User
	db.Find(&users)
	c.JSON(http.StatusOK, users)
}

func loginHandler(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user User
	result := db.Where("phone = ? AND password = ?", req.Phone, req.Password).First(&user)

	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "פרטים שגויים"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"role":    user.Role,
		"name":    user.FullName,
	})
}

func main() {
	initDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
	}))

	r.POST("/login", loginHandler)
	r.POST("/create-user", createUserHandler)
	r.GET("/users", getAllUsersHandler)

	r.Run(":8080")
}