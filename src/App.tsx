import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import GameCard from "./components/GameCard";
import { Game } from "./types/api-response";
import { getTrendingGames, updateSearchCount } from "./appwrite";
import { Models } from "appwrite";

const API_BASE_URL = "https://api.rawg.io/api";
const API_KEY = import.meta.env.VITE_RAWG_API_KEY as string;

console.log("API Key:", API_KEY);

const API_OPTIONS = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  mode: "cors",
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [gameList, setGameList] = useState<Game[]>([]);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [trendingGames, setTrendingGames] = useState<Models.Document[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);
  const [errorMessageTrending, setErrorMessageTrending] = useState<
    string | null
  >(null);

  // Debounce the search term to avoid too many API calls
  // This will set the debounced search term after 500ms of inactivity
  // when the user types in the search input
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchGames = async (query: string = "") => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = query
        ? `${API_BASE_URL}/games?key=${API_KEY}&page_size=10&search=${encodeURIComponent(
            query
          )}&search_exact=true`
        : `${API_BASE_URL}/games?key=${API_KEY}`;

      const response = await fetch(endpoint, API_OPTIONS as RequestInit);

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch games");
        setGameList([]);
        return;
      }

      setGameList(data.results);
      setNextPage(data.next);
      setPreviousPage(data.previous);

      if (query && data.results.length > 0) {
        const game = data.results[0];
        await updateSearchCount(query, game);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setErrorMessage("Failed to fetch games. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingGames = async () => {
    setIsLoadingTrending(true);
    setErrorMessageTrending(null);
    try {
      const games = await getTrendingGames();

      if (!games || games.length === 0) {
        setTrendingGames([]);
        return;
      }

      setTrendingGames(games);
    } catch (error) {
      console.error("Error fetching trending games:", error);
      setErrorMessageTrending(
        "Failed to fetch trending games. Please try again later."
      );
    } finally {
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchGames(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <h1>
            <img src="./hero.png" alt="Hero Banner" />
            Find <span className="text-gradient">Games</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {isLoadingTrending ? (
          <div className="my-8 mx-auto">
            <Spinner />
          </div>
        ) : errorMessageTrending ? (
          <p className="text-red-500 my-8">{errorMessageTrending}</p>
        ) : trendingGames.length === 0 ? (
          <p className="text-white my-8">No trending games found.</p>
        ) : (
          <section className="trending">
            <h2>Trending Games</h2>
            <ul>
              {trendingGames.map((game, index) => (
                <li key={game.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={game.poster_url}
                    alt={`Poster for ${game.game_id}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-games">
          <h2>All Games</h2>
          {isLoading && (
            <div className="my-8 mx-auto">
              <Spinner />
            </div>
          )}
          {!isLoading && !errorMessage && gameList.length === 0 && (
            <p className="text-white my-4">No games found.</p>
          )}
          {!isLoading && !errorMessage && gameList.length > 0 && (
            <ul>
              {gameList.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </ul>
          )}

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </section>
      </div>
    </main>
  );
};

export default App;
