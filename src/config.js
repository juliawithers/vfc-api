module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL:  'postgres://jxsafbnblwwfqy:9f7df1e38a7474985336f30c2361a5a09ca34cb49fea01b2dd51c6339922b133@ec2-50-17-90-177.compute-1.amazonaws.com:5432/dbm63dbamlpm2d'
    || "postgresql://postgres@localhost/vfc",
    TEST_DATABASE_URL= process.env.TEST_DATABASE_URL || "postgresql://postgres@localhost/vfc-test",
    CLIENT_ORIGIN: "http://localhost:3000"
    
    // API_TOKEN: "0810bd3e-6112-4c27-a63f-c533e885495c",
}