import { Game } from "../types/api-response";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <div className="movie-card">
      <img
        src={game.background_image ? game.background_image : "no-poster.png"}
        alt={`${game.name} poster`}
      />

      <div className="mt-4">
        <h3>{game.name}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="rating" />
            <p>{game.rating ? game.rating : "N/A"}</p>
          </div>

          <span>•</span>
          <p className="year">
            {game.released ? game.released.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
