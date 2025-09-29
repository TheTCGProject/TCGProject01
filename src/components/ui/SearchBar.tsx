import React, { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    const query = input.value.trim();
    if (query) {
      navigate(`/cards?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto group"
      role="search"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-secondary-500 transition-colors" />
        </div>
        
        <input
          id="homepage-search"
          name="search"
          type="text"
          autoComplete="off"
          placeholder="Search cards, sets, or deck strategies..."
          className="
            w-full pl-12 pr-32 py-4 text-lg
            bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm
            border border-gray-200/50 dark:border-gray-700/50
            rounded-2xl shadow-lg hover:shadow-xl
            text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent
            transition-all duration-300
          "
        />
        
        <button
          type="submit"
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            px-6 py-2.5 
            bg-gradient-to-r from-secondary-600 to-secondary-700
            text-white font-medium rounded-xl
            hover:from-secondary-700 hover:to-secondary-800
            focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
            transition-all duration-200 shadow-md hover:shadow-lg
            active:scale-95
          "
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;