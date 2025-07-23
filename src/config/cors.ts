// CORS Configuration
const corsOptions = {
  origin: ["https://trainlink.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
