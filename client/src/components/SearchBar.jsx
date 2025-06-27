import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
      <input
        type="text"
        placeholder="Search manga by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border rounded-md w-full sm:w-1/2 bg-gray-800 text-white placeholder-gray-400"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border rounded-md bg-gray-800 text-white"
      >
        <option className="text-black">All</option>
        <option className="text-black">Plan to Read</option>
        <option className="text-black">Reading</option>
        <option className="text-black">Completed</option>
      </select>
    </div>
  );
};

export default SearchBar;
