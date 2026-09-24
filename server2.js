require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.json())


