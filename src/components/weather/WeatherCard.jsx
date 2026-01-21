
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Cloud, Sun, CloudRain, Wind, Droplets, ThermometerSun, ThermometerSnowflake, CloudLightning, CloudFog, CloudDrizzle, ArrowRightCircle } from "lucide-react";

export default function WeatherCard({ latitude, longitude, cityName }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!latitude || !longitude) {
        if (!cityName) return;
      }

      try {
        setLoading(true);
        setError(null);

        const locationQuery = latitude && longitude 
          ? `latitude ${latitude} longitude ${longitude}`
          : `${cityName}, Santa Catarina, Brasil`;

        const response = await InvokeLLM({
          prompt: `Forneça a previsão do tempo atual e para os próximos 3 dias para ${locationQuery}. Inclua: temperatura atual, temperatura máxima/mínima, condição do tempo (ensolarado, chuvoso, etc), velocidade do vento, umidade, probabilidade de chuva. Formate os dados de forma estruturada.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              current: {
                type: "object",
                properties: {
                  temperature: { type: "number" },
                  condition: { type: "string" },
                  humidity: { type: "number" },
                  wind_speed: { type: "number" },
                  icon: { type: "string" }
                }
              },
              forecast: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    min_temp: { type: "number" },
                    max_temp: { type: "number" },
                    condition: { type: "string" },
                    rain_probability: { type: "number" },
                    icon: { type: "string" }
                  }
                }
              },
              location: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  time: { type: "string" }
                }
              }
            }
          }
        });

        setWeatherData(response);
      } catch (err) {
        console.error("Erro ao buscar dados meteorológicos:", err);
        setError("Não foi possível carregar os dados meteorológicos no momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude, cityName]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Cloud />;
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sol') || conditionLower.includes('limpo') || conditionLower.includes('clear')) {
      return <Sun className="text-yellow-500" />;
    } else if (conditionLower.includes('chuva') || conditionLower.includes('rain')) {
      return <CloudRain className="text-gray-600" />;
    } else if (conditionLower.includes('nublado') || conditionLower.includes('nuvens') || conditionLower.includes('clouds')) {
      return <Cloud className="text-gray-400" />;
    } else if (conditionLower.includes('trovoada') || conditionLower.includes('thunder')) {
      return <CloudLightning className="text-purple-600" />;
    } else if (conditionLower.includes('neblina') || conditionLower.includes('nevoeiro') || conditionLower.includes('fog')) {
      return <CloudFog className="text-gray-400" />;
    } else if (conditionLower.includes('garoa') || conditionLower.includes('drizzle')) {
      return <CloudDrizzle className="text-blue-400" />;
    }
    
    return <Cloud />;
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 flex justify-center items-center min-h-[180px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-500">Carregando dados meteorológicos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className="mb-6 overflow-hidden border-blue-100">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Previsão do Tempo</h3>
            <span className="text-sm opacity-80">{weatherData.location?.name}</span>
          </div>
        </div>
        
        {/* Tempo atual */}
        <div className="p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3">
                {getWeatherIcon(weatherData.current?.condition)}
              </div>
              <div>
                <div className="text-2xl font-bold">{weatherData.current?.temperature}°C</div>
                <div className="text-gray-500">{weatherData.current?.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <Wind className="w-4 h-4 mr-1" />
                {weatherData.current?.wind_speed} km/h
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Droplets className="w-4 h-4 mr-1" />
                {weatherData.current?.humidity}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Previsão para os próximos dias */}
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div className="p-4 grid grid-cols-1 divide-y">
            {weatherData.forecast.slice(0, 3).map((day, index) => (
              <div key={index} className={`flex items-center justify-between py-2 ${index === 0 ? 'pt-0' : ''}`}>
                <div className="flex items-center">
                  <div className="mr-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div>
                    <div className="font-medium">{day.date}</div>
                    <div className="text-gray-500 text-sm">{day.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <ThermometerSun className="w-4 h-4 mr-1 text-red-500" />
                    <span>{day.max_temp}°C</span>
                  </div>
                  <div className="flex items-center">
                    <ThermometerSnowflake className="w-4 h-4 mr-1 text-blue-500" />
                    <span>{day.min_temp}°C</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Chuva: {day.rain_probability}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
