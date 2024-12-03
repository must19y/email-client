import styles from "./index.module.css";

interface FavouriteMarkProps {
  isFavourite: boolean;
  toggleFavourite: () => void;
}

const FavouriteMark = ({ isFavourite, toggleFavourite }: FavouriteMarkProps): JSX.Element => {
  return (
    <button className={styles.favourite} onClick={toggleFavourite}>
      {isFavourite ? "Favourite" : "Mark as Favourite"}
    </button>
  );
};

export default FavouriteMark;
