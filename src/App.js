import './App.css';
import { useState, useEffect } from 'react';
import dayBg from './day-bg.PNG';
import nightBg from './night-bg.jpg';

const App = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showForecast, setShowForecast] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

    useEffect(() => {
        document.querySelector('.app').style.backgroundImage = 
            `url(${isDarkMode ? nightBg : dayBg})`;
    }, [isDarkMode]);

    const fetchWeather = async (e) => {
        e.preventDefault();
        if (!city.trim()) return;

        setLoading(true);
        setError('');
        setWeather(null);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'City not found');
            }

            setWeather(data);
            setCity('');
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Could not find that city. Please try again!');
        } finally {
            setLoading(false);
        }
    };

    const fetchWeatherByCoords = async (lat, lon) => {
        setLoading(true);
        setError('');
        setWeather(null);

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not get weather');
            }

            setWeather(data);
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Could not get weather for your location!');
        } finally {
            setLoading(false);
            setLoadingLocation(false);
        }
    };

    const handleUseLocation = () => {
        setLoadingLocation(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Could not get your location. Please enable location services.');
                setLoadingLocation(false);
            }
        );
    };

    const fetch5DayForecast = async () => {
        if (!weather) return;

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${weather.name}&appid=${API_KEY}&units=metric`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Could not get forecast');
            }

            const dailyForecasts = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
            setForecast(dailyForecasts);
            setShowForecast(true);
        } catch (err) {
            console.error('Forecast error:', err);
        }
    };

    const handleClose = () => {
        window.close();
    };

    const getWeatherEmoji = (condition) => {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('clear')) return '☀️';
        if (conditionLower.includes('cloud')) return '☁️';
        if (conditionLower.includes('rain')) return '🌧️';
        if (conditionLower.includes('snow')) return '❄️';
        if (conditionLower.includes('thunder')) return '⛈️';
        if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
        return '🌤️';
    };

    const getClothingRecommendation = (temp) => {
        if (temp < 0) return 'Heavy coat, beanie';
        if (temp < 10) return 'Warm jacket, sweater';
        if (temp < 18) return 'Light jacket';
        if (temp < 25) return 'T-shirt, light layers';
        return 'Tank top, shorts';
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="app">
            <div className={`window-popup ${isDarkMode ? 'dark-mode' : ''}`}>
                <div className="window-header">
                    <div className="window-title">WEATHER.EXE</div>
                    <div className="window-buttons">
                        <button className="window-btn minimize">−</button>
                        <button className="window-btn maximize">□</button>
                        <button className="window-btn close" onClick={handleClose}>×</button>
                    </div>
                </div>

                <div className="window-toolbar">
                    {weather && (
                        <button className="toolbar-back-button" onClick={() => setWeather(null)}>
                            ← search again
                        </button>
                    )}
                    <div className="toolbar-spacer"></div>
                    <button 
                        className={`mode-toggle ${isDarkMode ? 'dark' : 'light'}`}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                    >
                        {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'night mode' : 'day mode'}
                    </button>
                </div>

                <div className="window-content">
                    {!weather ? (
                        <div className="search-screen">
                            <h2 className="pixel-title">☁️ Weather Check ☁️</h2>
                            <form onSubmit={fetchWeather} className="pixel-form">
                                <input
                                    type="text"
                                    placeholder="enter city name..."
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="pixel-input"
                                    autoFocus
                                />
                                <button type="submit" className="pixel-button" disabled={loading || loadingLocation}>
                                    {loading ? 'searching...' : 'get weather'}
                                </button>
                            </form>

                            <div className="divider">
                                <span>or</span>
                            </div>

                            <button 
                                className="location-button" 
                                onClick={handleUseLocation}
                                disabled={loading || loadingLocation}
                            >
                                📍 {loadingLocation ? 'getting location...' : 'use my location'}
                            </button>

                            {error && (
                                <div className="pixel-error">
                                    {error} ...are you sure this city exists?
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="weather-display">
                            <div className="weather-header-info">
                                <div className="weather-status">{weather.weather[0].description}</div>
                                <div className="weather-stats">
                                    <div>Humidity: {weather.main.humidity}%</div>
                                    <div>Wind: {Math.round(weather.wind.speed * 3.6)} km/h</div>
                                </div>
                            </div>

                            <div className="main-display">
                                <div className="weather-visual">
                                    <div className="pixel-emoji">
                                        {getWeatherEmoji(weather.weather[0].main)}
                                    </div>
                                </div>

                                <div className="temp-display">
                                    <div className="main-temp">{Math.round(weather.main.temp)}°C</div>
                                    <div className="feels-like">feels like {Math.round(weather.main.feels_like)}°C</div>
                                </div>
                            </div>

                            <div className="additional-info">
                                <div className="info-section">
                                    <div className="info-label">Location:</div>
                                    <div className="info-value">{weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ''}</div>
                                </div>
                                <div className="info-section">
                                    <div className="info-label">Recommendation:</div>
                                    <div className="info-value">{getClothingRecommendation(weather.main.temp)}</div>
                                </div>
                            </div>

                            <button className="forecast-button" onClick={fetch5DayForecast}>
                                📅 5-day forecast
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showForecast && forecast && (
                <div className="forecast-overlay" onClick={() => setShowForecast(false)}>
                    <div className={`forecast-popup ${isDarkMode ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="forecast-header">
                            <div className="forecast-title">5-Day Forecast</div>
                            <button className="forecast-close" onClick={() => setShowForecast(false)}>×</button>
                        </div>

                        <div className="forecast-content">
                            {forecast.map((day, index) => (
                                <div key={index} className="forecast-day">
                                    <div className="forecast-date">{formatDate(day.dt)}</div>
                                    <div className="forecast-emoji">{getWeatherEmoji(day.weather[0].main)}</div>
                                    <div className="forecast-temp">{Math.round(day.main.temp)}°C</div>
                                    <div className="forecast-desc">{day.weather[0].description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;