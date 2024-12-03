import { useState, useEffect } from "react";
import styles from "./index.module.css";
import Avatar from "../Avatar-logo";
import FavouriteMark from "./../FavouriteMark";

const GetMail = (): JSX.Element => {
  const [emails, setEmails] = useState<
    Array<{
      id: string;
      from: string;
      subject: string;
      short_description: string;
      date: string;
      read: boolean;
      favourite: boolean; // Add favourite property
    }>
  >([]);
  const [page, setPage] = useState(1);
  const [showReadOnly, setShowReadOnly] = useState(false); // Toggle to filter by "Read"
  const [showUnreadOnly, setShowUnreadOnly] = useState(false); // Toggle to filter by "Unread"
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false); // Toggle to filter by "Favourite"
  const [readEmails, setReadEmails] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<{
    id: string;
    body: string;
    subject: string;
    favourite: boolean;
  } | null>(null);

  const handleEmailClick = async (id: string) => {
    const email = emails.find((email) => email.id === id);
    if (!email) return;
  
    try {
      const response = await fetch(`https://flipkart-email-mock.vercel.app/?id=${id}`);
      const data = await response.json();
  
      // Update selectedEmail
      setSelectedEmail({
        id: data.id,
        body: data.body.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags
        subject: data.subject,
        favourite: email.favourite, // Sync favourite state
      });

      setReadEmails((prev) => new Set(prev.add(id))); // Mark email as read
  
      // Mark email as read in the emails array
      setEmails((prev) =>
        prev.map((email) =>
          email.id === id ? { ...email, read: true } : email
        )
      );
    } catch (err) {
      console.error("Error fetching email details:", err);
    }
  };
  
  const toggleFavourite = (id: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, favourite: !email.favourite } : email
      )
    );
  
    // If the selected email is the one being updated, synchronize it
    setSelectedEmail((prev) => {
      if (prev?.id === id) {
        return { ...prev, favourite: !prev.favourite };
      }
      return prev;
    });
  };
  

  const handleReadFilterClick = () => {
    setShowReadOnly((prev) => !prev);
    setShowUnreadOnly(false);
    setShowFavouritesOnly(false);
  };

  const handleUnreadFilterClick = () => {
    setShowUnreadOnly((prev) => !prev);
    setShowReadOnly(false);
    setShowFavouritesOnly(false);
  };

  const handleFavouriteFilterClick = () => {
    setShowFavouritesOnly((prev) => !prev);
    setShowReadOnly(false);
    setShowUnreadOnly(false);
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(`https://flipkart-email-mock.vercel.app/?page=${page}`);
        const data = await response.json();

        setEmails(
          data.list.map((email: any) => ({
            id: email.id,
            from: email.from.email,
            subject: email.subject,
            short_description: email.short_description,
            date: email.date,
            read: readEmails.has(email.id), // Check if email is marked as read
            favourite: false, // Default to not favourite
          }))
        );
      } catch (err) {
        console.error("Error fetching emails:", err);
      }
    };
    fetchEmails();
  }, [page, readEmails]);

  return (
    <main className={`${styles.container} ${selectedEmail ? styles.shiftLeft : ""}`}>
      <div className={styles.filterBar}>
        <button className={styles.filterButton} onClick={handleReadFilterClick}>
          Filter by: {showReadOnly ? "All" : "Read"}
        </button>
        <button className={styles.filterButton} onClick={handleUnreadFilterClick}>
          Filter by: {showUnreadOnly ? "All" : "Unread"}
        </button>
        <button className={styles.filterButton} onClick={handleFavouriteFilterClick}>
          Filter by: {showFavouritesOnly ? "All" : "Favourites"}
        </button>
      </div>

      <section className={styles.emailList}>
        {emails
          .filter((email) =>
            showReadOnly
              ? email.read
              : showUnreadOnly
              ? !email.read
              : showFavouritesOnly
              ? email.favourite
              : true
          ) // Filter based on read/unread/favourite status
          .map((email) => (
            <article
              key={email.id}
              className={`${styles.email} ${email.read ? styles.read : ""}`}
              onClick={() => handleEmailClick(email.id)}
              tabIndex={0}
              role="button"
            >
              <Avatar letter={email.from} />
              <header>
                <h1>{email.from}</h1>
                <h2>{email.subject}</h2>
              </header>
              <p>{email.short_description}</p>
              <footer>
                <time dateTime={email.date}>{new Date(email.date).toLocaleDateString()}</time>
                <FavouriteMark
                  isFavourite={email.favourite}
                  toggleFavourite={() => toggleFavourite(email.id)}
                />
              </footer>
            </article>
          ))}
        {page < 2 && !showReadOnly && !showUnreadOnly && !showFavouritesOnly && (
          <button className={styles.loadMore} onClick={() => setPage(page + 1)}>
            Load Next Page
          </button>
        )}
      </section>

      {selectedEmail && (
        <section className={styles.emailDetail}>
          <header>
            <h2>{selectedEmail.subject}</h2>
          </header>
          <p>{selectedEmail.body}</p>
          <FavouriteMark
            isFavourite={selectedEmail.favourite}
            toggleFavourite={() => toggleFavourite(selectedEmail.id)}
          />
        </section>
      )}
    </main>
  );
};

export default GetMail;
