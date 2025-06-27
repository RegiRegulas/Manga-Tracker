import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import MangaCard from "../components/MangaCard";
import EditForm from "../components/EditForm";

const Library = ({ refreshFlag }) => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredList, setFilteredList] = useState([]);
  const [editingManga, setEditingManga] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    chaptersRead: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const fetchManga = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://manga-tracker-backend.onrender.com/api/manga", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setMangaList(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load manga");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManga();
  }, [refreshFlag]);

  useEffect(() => {
    let filtered = mangaList;

    if (statusFilter !== "All") {
      filtered = filtered.filter((manga) => manga.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((manga) =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredList(filtered);
  }, [searchTerm, statusFilter, mangaList]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchSearchResults = async () => {
        if (!searchTerm.trim()) {
          setSearchResults([]); // ✅ only clear if blank
          setIsSearching(false);
          return;
        }

        try {
          setIsSearching(true);
          const res = await axios.get(
            `https://manga-tracker-backend.onrender.com/api/manga/search?title=${encodeURIComponent(
              searchTerm
            )}`
          );
          setSearchResults(res.data);
          setIsSearching(false);
        } catch (err) {
          console.error("Error fetching from MangaDex:", err);
          setIsSearching(false);
        }
      };

      fetchSearchResults();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
  const fetchRecommendations = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://manga-tracker-backend.onrender.com/api/manga/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  fetchRecommendations();
}, []);


  const handleEditClick = (manga) => {
    setEditingManga(manga);
    setFormData({
      title: manga.title,
      status: manga.status,
      chaptersRead: manga.chaptersRead.toString(),
    });
    setError("");
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manga?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://manga-tracker-backend.onrender.com/api/manga/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchManga();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete manga");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://manga-tracker-backend.onrender.com/api/manga/${editingManga.id}`,
        {
          title: formData.title,
          status: formData.status,
          chaptersRead: Number(formData.chaptersRead),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingManga(null);
      fetchManga();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update manga");
    }
  };

  const handleAddToLibrary = async (manga) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: manga.title,
        status: "Plan to Read",
        chaptersRead: 0,
        coverUrl: manga.coverUrl,
        genres: Array.isArray(manga.genres) ? manga.genres : [],
      };

      console.log("📦 Payload being sent:", payload); // ✅

      await axios.post("https://manga-tracker-backend.onrender.com/api/manga", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchManga();
      setTimeout(() => setSearchTerm(""), 500);
    } catch (err) {
      console.error(
        "❌ Failed to add manga:",
        err.response?.data || err.message
      );
      setError("Failed to add manga to library");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error && !editingManga) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4">My Library</h1>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* MangaDex Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            MangaDex Results
          </h2>
          <div className="flex flex-wrap gap-4">
            {searchResults.map((manga) => (
              <div
                key={manga.id}
                className="bg-gray-800 rounded-xl p-4 w-full sm:w-64 shadow-md text-white"
              >
                <img
                  src={manga.coverUrl}
                  alt={`${manga.title} cover`}
                  className="w-full h-60 object-cover rounded mb-3"
                />
                <h3 className="text-lg font-semibold">{manga.title}</h3>
                <p className="text-sm text-gray-300 mb-1">
                  Genres: {manga.genres?.join(", ") || "N/A"}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {manga.description?.slice(0, 100) || "No description"}...
                </p>
                <button
                  onClick={() => handleAddToLibrary(manga)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Add to My Library
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Own Manga Library */}
      <div className="p-4 flex flex-wrap gap-4">
        {filteredList.length === 0 && !isSearching && !searchResults.length ? (
          <p className="text-white">No manga matched your search.</p>
        ) : (
          filteredList.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl text-white font-semibold mt-6 mb-2">
            Recommended for You
          </h2>
          <div className="flex flex-wrap gap-4">
            {recommendations.map((manga) => (
              <div
                key={manga.id}
                className="bg-gray-700 rounded p-3 text-white w-60"
              >
                <img
                  src={manga.cover_url}
                  alt={`${manga.title} cover`}
                  className="w-full h-56 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-bold">{manga.title}</h3>
                <p className="text-sm text-gray-300">
                  {manga.genres?.join(", ") || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingManga && (
        <EditForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setEditingManga(null);
            setError("");
          }}
          error={error}
        />
      )}
    </div>
  );
};

export default Library;
