module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres@localhost/vfc",
    CLIENT_ORIGIN: "http://localhost:3000"
}