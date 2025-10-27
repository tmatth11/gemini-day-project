import { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { NavLink } from "react-router-dom";

function App() {
    const [topic, setTopic] = useState("");
    const [stories, setStories] = useState([
        {
            id: 0,
            headline: "",
            description: "",
            author: "",
            date: "",
            time: "",
            paragraphs: []
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const savedStories = localStorage.getItem('stories');
        if (savedStories) {
            setStories(JSON.parse(savedStories));
        }
        const lastTopic = localStorage.getItem('lastTopic');
        if (lastTopic) {
            setTopic(lastTopic);
        }
    }, []);

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const numStories = 5;

    const NewsSchema = {
        type: Type.ARRAY,
        minItems: numStories,
        maxItems: numStories,
        items: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, maxLength: 70 },
                description: { type: Type.STRING, maxLength: 100 },
                author: { maxLength: 20, type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                paragraphs: {
                    type: Type.ARRAY,
                    maxItems: 5,
                    items: { type: Type.STRING, maxLength: 200 }
                },
            },
            propertyOrdering: ["headline", "description", "author", "date", "time", "paragraphs"],
        },
    };

    const isEmpty = topic.trim() === "";

    const generateStories = async (topicToUse) => {
        const output = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate ${numStories} fake and satire news articles about the topic: "${topicToUse}". Each article should have a headline, a short description, an author name (first and last), a date (Example: Saturday, October 25, 2025), a time in CST (Example: 1:11 PM CST (DO NOT USE ZEROS FOR THE FIRST DIGIT OF THE HOURS)), and 3-5 paragraphs of content. The articles should be quite ridiculous and humorous, but don't include any swear words or inappropriate content. Respond with the specified JSON schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: NewsSchema
            }
        });

        const response = JSON.parse(output.text);

        return response;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        localStorage.setItem('lastTopic', topic);

        const response = await generateStories(topic);
        const storiesWithId = response.map((story, idx) => ({
            ...story,
            id: idx
        }));
        setStories(storiesWithId);
        localStorage.setItem('stories', JSON.stringify(storiesWithId));

        setLoading(false);
    };

    const handleLoadMore = async () => {
        setLoadingMore(true);

        const response = await generateStories(topic);
        const startIdx = stories.length;
        const moreStories = response.map((story, idx) => ({
            ...story,
            id: startIdx + idx
        }));
        setStories([...stories, ...moreStories]);
        localStorage.setItem('stories', JSON.stringify([...stories, ...moreStories]));

        setLoadingMore(false);
    };

    return (
        <div className='home-container'>
            <div className="header">
                <h1 className="title">Welcome to Fake News!</h1>
                <p className="subtitle">The most unreliable news source on the internet.</p>
            </div>
            <div className="content">
                <form className="search-form" onSubmit={handleSubmit}>
                    <label className="news-label" htmlFor="news-input">
                        Fill out the textbox below to get your fake news:
                    </label>
                    <div className="news-form">
                        <input
                            className="news-input"
                            type="text"
                            placeholder="Enter fake news topic here..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        <button
                            className="submit-btn"
                            type="submit"
                            disabled={isEmpty || loading || loadingMore}
                        >
                            Get Fake News
                        </button>
                    </div>
                </form>

                {loading ? <p className='loading-indicator'>Loading...</p> :
                    <div className='story-results'>
                        <div className="story-list">
                            {stories.map((story) => (
                                <NavLink
                                    to={`/stories/${story.id}`}
                                    key={story.id}
                                    className='story-headline'
                                    state={{ story }}
                                >
                                    {story.headline}
                                </NavLink>
                            ))}
                        </div>

                        {stories.length > 0 && stories[0].headline !== "" &&
                            (loadingMore
                                ? <p className='loading-indicator'>Loading more stories...</p>
                                : <button className="more-btn" onClick={handleLoadMore}>Load More</button>
                            )
                        }

                    </div>
                }
            </div>
        </div>
    );
}

export default App;
