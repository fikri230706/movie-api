const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Membaca data film
function getMovies() {
    const data = fs.readFileSync("movies.json", "utf-8");
    return JSON.parse(data);
}

// Menyimpan data film
function saveMovies(movies) {
    fs.writeFileSync(
        "movies.json",
        JSON.stringify(movies, null, 2)
    );
}

// ===============================
// HALAMAN UTAMA
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Movie API berhasil dijalankan!"
    });
});

// ===============================
// GET SEMUA FILM
// ===============================

app.get("/api/movies", (req, res) => {
    const movies = getMovies();

    res.json(movies);
});

// ===============================
// SEARCH FILM BERDASARKAN ID / JUDUL
// ===============================

app.get("/api/movies/search", (req, res) => {
    const movies = getMovies();

    const keyword = req.query.keyword || "";

    const cleanKeyword = keyword
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const results = movies.filter(movie => {

        // Mencari berdasarkan ID
        const idMatch = movie.id.toString() === keyword;

        // Mencari berdasarkan judul
        if (!movie.title) {
            return idMatch;
        }

        const cleanTitle = movie.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        const titleMatch = cleanTitle.includes(cleanKeyword);

        return idMatch || titleMatch;
    });

    res.json(results);
});

// ===============================
// GET FILM BERDASARKAN ID
// ===============================

app.get("/api/movies/:id", (req, res) => {
    const movies = getMovies();

    const id = parseInt(req.params.id);

    const movie = movies.find(movie => movie.id === id);

    if (!movie) {
        return res.status(404).json({
            message: "Film tidak ditemukan"
        });
    }

    res.json(movie);
});

// ===============================
// POST - MENAMBAH FILM
// ===============================

app.post("/api/movies", (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({
            message: "Judul film wajib diisi"
        });
    }

    const movies = getMovies();

    const newId = movies.length > 0
        ? Math.max(...movies.map(movie => movie.id)) + 1
        : 1;

    const newMovie = {
        id: newId,
        title: req.body.title,
        genre: req.body.genre || "Action",
        year: req.body.year
    };

    movies.push(newMovie);

    saveMovies(movies);

    res.status(201).json({
        message: "Film berhasil ditambahkan",
        movie: newMovie
    });
});

// ===============================
// PUT - MENGUBAH FILM
// ===============================

app.put("/api/movies/:id", (req, res) => {

    const movies = getMovies();

    const id = parseInt(req.params.id);

    const movieIndex = movies.findIndex(
        movie => movie.id === id
    );

    if (movieIndex === -1) {
        return res.status(404).json({
            message: "Film tidak ditemukan"
        });
    }

    movies[movieIndex].title =
        req.body.title || movies[movieIndex].title;

    movies[movieIndex].genre =
        req.body.genre || movies[movieIndex].genre;

    movies[movieIndex].year =
        req.body.year || movies[movieIndex].year;

    saveMovies(movies);

    res.json({
        message: "Film berhasil diubah",
        movie: movies[movieIndex]
    });
});

// ===============================
// DELETE - MENGHAPUS FILM
// ===============================

app.delete("/api/movies/:id", (req, res) => {

    const movies = getMovies();

    const id = parseInt(req.params.id);

    const movieIndex = movies.findIndex(
        movie => movie.id === id
    );

    if (movieIndex === -1) {
        return res.status(404).json({
            message: "Film tidak ditemukan"
        });
    }

    const deletedMovie = movies.splice(movieIndex, 1)[0];

    saveMovies(movies);

    res.json({
        message: "Film berhasil dihapus",
        movie: deletedMovie
    });
});

// ===============================
// MENJALANKAN SERVER
// ===============================

app.listen(PORT, () => {
    console.log(
        `Server berjalan di http://localhost:${PORT}`
    );
});