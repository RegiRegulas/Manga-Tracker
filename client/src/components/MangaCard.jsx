import React from "react";

const MangaCard = ({ manga, onEdit, onDelete }) => {
  return (
    <div className="w-full sm:w-64 bg-gray-800 rounded-xl shadow-md p-4 text-white">
      <img
        src={manga.cover_url || "/fallback.jpg"}
        alt={`${manga.title} cover`}
        className="w-full h-60 object-cover rounded mb-3"
      />
      <h3 className="text-lg font-semibold">{manga.title}</h3>
      <p className="text-sm text-gray-300">Status: {manga.status}</p>
      <p className="text-sm text-gray-300">
        Chapters Read: {manga.chaptersRead}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
          onClick={() => onEdit(manga)}
        >
          Edit
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={() => onDelete(manga.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MangaCard;
