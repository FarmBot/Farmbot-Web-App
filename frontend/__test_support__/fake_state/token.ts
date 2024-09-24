import { AuthState } from "../../auth/interfaces";

export const auth: AuthState = {
  token: {
    unencoded: {
      jti: "xyz",
      iss: "//localhost:3000",
      aud: "unknown",
      bot: "device_123",
      mqtt_ws: "//localhost:3000"
    },
    encoded: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbk" +
      "BhZG1pbi5jb20iLCJpYXQiOjE0OTU1NjkwODQsImp0aSI6ImIzODkxNWNhLTNkN2Et" +
      "NDc1NC04MTUyLWQ0MzA2Yjg4NTA0YyIsImlzcyI6Ii8vbG9jYWxob3N0OjMwMDAiLC" +
      "JleHAiOjE0OTkwMjUwODQsIm1xdHQiOiIxMC4wLjAuNiIsIm9zX3VwZGF0ZV9zZXJ2" +
      "ZXIiOiJodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zL2Zhcm1ib3QvZmFybWJvdF" +
      "9vcy9yZWxlYXNlcy9sYXRlc3QiLCJmd191cGRhdGVfc2VydmVyIjoiaHR0cHM6Ly9h" +
      "cGkuZ2l0aHViLmNvbS9yZXBvcy9GYXJtQm90L2Zhcm1ib3QtYXJkdWluby1maXJtd2" +
      "FyZS9yZWxlYXNlcy9sYXRlc3QiLCJib3QiOiJkZXZpY2VfNDAzIn0." +
      "Gie_-X5F_CrnmrF8AGxnXcfOHS1sK3eFqLectr3Wa-TnIZbIFMr3bVrRT53GPPb7C4" +
      "HKIdMwfgGYxpaGSOD77qa0qnxw1FraXTnJgbIJXKipBVN9UQ4PqcYgjAVdZ678A-Xq" +
      "XV6SGE624zdr7S7mQ6uj7qpa2LMH4P37R3BIB26G7E8xDcVOGqL5Oiwr9DPajBX3zd" +
      "hXSbH3k4PyxqvPOLYso-R7kjfpOnfFCMfMZLW8TQtg-yj82zs93RP2DHOOx-jxek69" +
      "tmgNyP3FJaoWHwHW7bXOEv09p3dhNVTCSVNKD9LZczLpuXV7U4oSmL6KLkbzsM6G0P" +
      "9rrbJ9ASYaOw"
  },
  user: {
    id: 0,
    name: "name",
    email: "email",
    language: "english",
  }
};
