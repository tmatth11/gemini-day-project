import { useLocation, useNavigate } from "react-router-dom";

function Story() {
    const location = useLocation();
    const story = location.state?.story;

    const navigate = useNavigate();

    return (
        <div className="story-page">
            <button onClick={() => navigate('/')} className="back-btn">
                Back
            </button>
            <div className="story-container">
                <div className="story-header">
                    <h2 className="story-headline">
                        {story?.headline}
                    </h2>
                    <p className="story-description">{story?.description}</p>
                    <p className="story-author">By: {story?.author}</p>
                    <p className="story-datetime">{story?.date} • {story?.time}</p>
                </div>
                <hr className="divisor" />
                {
                    story?.paragraphs.map((paragraph, idx) => (
                        <p className="story-paragraph" key={idx}>{paragraph}</p>
                    ))
                }
            </div>
        </div>
    )
}

export default Story;