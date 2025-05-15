import { NextApiRequest, NextApiResponse } from 'next';
// Não precisamos mais de child_process para executar um script externo
// import { spawn } from 'child_process';
// import path from 'path';

// Importar swisseph.
import swisseph from 'swisseph'; 

// Importar funções de date-fns e date-fns-tz
import { parse, zonedTimeToUtc } from 'date-fns-tz'; // Importar zonedTimeToUtc e parse
// import { format } from 'date-fns'; // Não precisamos de format aqui

// Importar geo-tz para buscar timezone por coordenadas
import * as findTimeZone from 'geo-tz';

// Define o fuso horário padrão para fallback (menos provável agora com geo-tz)
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

// Definir os ângulos dos aspectos maiores e menores em graus
const ASPECTS = {
    CONJUNCTION: 0,       // Conjunção
    OPPOSITION: 180,      // Oposição
    TRINE: 120,           // Trígono
    SQUARE: 90,           // Quadratura
    SEXTIL: 60,           // Sextil
    QUINCUNX: 150,        // Quincúncio (Inconjunct)
    SEMISEXTIL: 30,       // Semisextil
    SEMISQUARE: 45,       // Semiquadratura (Octil)
    SESQUIQUADRATE: 135,  // Sesquiquadratura (Trino e meio)
    // Você pode adicionar outros aspectos se desejar
};

// Definir orbes base para cada aspecto em graus
// Estes são valores de partida e serão ajustados pela função getOrb
const BASE_ASPECT_ORBS: { [key: string]: number } = {
    CONJUNCTION: 8,  
    OPPOSITION: 8,
    TRINE: 7,
    SQUARE: 7,
    SEXTIL: 6,
    QUINCUNX: 5,
    SEMISEXTIL: 2,
    SEMISQUARE: 3,
    SESQUIQUADRATE: 3,
};

// Fator de ajuste para orbes envolvendo Sol ou Lua
const LUMinary_ORB_FACTOR = 1.5; // Exemplo: orbe para Sol/Lua aspecto será 1.5x a orbe base
const ANGLE_ORB_FACTOR = 1.2; // Exemplo: orbe para aspectos envolvendo Asc/MC será 1.2x a orbe base

// Função para obter a orbe para um aspecto entre dois corpos celestes/pontos
const getOrb = (aspectName: string, body1Name: string, body2Name: string): number => {
    const baseOrb = BASE_ASPECT_ORBS[aspectName];
    if (!baseOrb) {
        return 0; // Retorna 0 se o aspecto não for definido
    }

    let orb = baseOrb;

    // Aumentar orbe se envolver Sol ou Lua
    if (body1Name === 'Sun' || body1Name === 'Moon' || body2Name === 'Sun' || body2Name === 'Moon') {
        orb *= LUMinary_ORB_FACTOR;
    }
     // Aumentar orbe se envolver Ascendente ou Meio do Céu (usando nomes definidos em bodyPositions)
    if (body1Name === 'Ascendente' || body1Name === 'Meio do Céu' || body2Name === 'Ascendente' || body2Name === 'Meio do Céu') {
        orb *= ANGLE_ORB_FACTOR;
    }

    // Pode adicionar lógica para outros pares de planetas ou pontos específicos aqui

    return orb;
};

// Definir os nomes dos signos do zodíaco em ordem (Tropical Zodiac)
const ZODIAC_SIGNS = [
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 
    'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

// Função para obter o signo e o grau dentro do signo a partir de uma longitude em graus
const getSignAndDegree = (longitude: number): { sign: string, degree: number, minute: number, second: number } => {
    // Normalizar a longitude para estar entre 0 e 360
    let normalizedLongitude = longitude % 360;
    if (normalizedLongitude < 0) {
        normalizedLongitude += 360;
    }

    const signIndex = Math.floor(normalizedLongitude / 30);
    const degreeInSign = normalizedLongitude % 30;

    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    const seconds = Math.floor(((degreeInSign - degrees) * 60 - minutes) * 60);

    return {
        sign: ZODIAC_SIGNS[signIndex],
        degree: degrees,
        minute: minutes,
        second: seconds
    };
};

// Função para determinar a casa de uma longitude, dadas as cúspides das casas
const getHouse = (longitude: number, houseCusps: number[]): number => {
    // As cúspides das casas geralmente são retornadas em ordem da casa 1 à 12.
    // A cúspide da casa 1 (Ascendente) marca o início da casa 1.
    // A cúspide da casa 2 marca o início da casa 2, e assim por diante.
    // O ponto está na casa N se sua longitude estiver entre a cúspide da casa N e a cúspide da casa N+1.
    // A casa 12 é especial, seu limite é a cúspide da casa 1 (Ascendente) no próximo ciclo.

    // Normalizar a longitude para estar entre 0 e 360
     let normalizedLongitude = longitude % 360;
    if (normalizedLongitude < 0) {
        normalizedLongitude += 360;
    }

    // Normalizar as cúspides das casas também
    const normalizedCusps = houseCusps.map(cusp => {
        let normalizedCusp = cusp % 360;
        if (normalizedCusp < 0) {
            normalizedCusp += 360;
        }
        return normalizedCusp;
    });

    // Encontrar a casa
    for (let i = 0; i < 12; i++) {
        const cuspStart = normalizedCusps[i];
        const cuspEnd = normalizedCusps[(i + 1) % 12]; // A cúspide final da casa é a próxima cúspide

        // Lidar com o cruzamento de 0 graus (quando a cúspide final é menor que a inicial)
        if (cuspStart < cuspEnd) {
            if (normalizedLongitude >= cuspStart && normalizedLongitude < cuspEnd) {
                return i + 1; // Casas são 1-indexadas
            }
        } else {
            // O ponto está na casa se for maior ou igual à cúspide inicial OU menor que a cúspide final (cruzando 0)
            if (normalizedLongitude >= cuspStart || normalizedLongitude < cuspEnd) {
                 return i + 1; // Casas são 1-indexadas
            }
        }
    }

    // Se por algum motivo não encontrar (não deve acontecer com longitudes normalizadas)
    return 0; 
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, dob, time, city, state } = req.body;

  if (!name || !dob || !time || !city || !state) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // ===============================================================
    // LÓGICA DE CÁLCULO DO MAPA ASTRAL COM SWISSEPH
    // ===============================================================

    // 2. Obter coordenadas geográficas (latitude, longitude) para a cidade/estado usando Nominatim (OpenStreetMap).
    //    ATENÇÃO: Verifique a política de uso do Nominatim para sua aplicação.
    const getCoordinates = async (city: string, state: string): Promise<{ lat: number, lon: number }> => {
      const query = `${city}, ${state}, Brazil`; // Adiciona 'Brazil' para melhorar a busca
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

      try {
        const response = await fetch(url, {
             headers: {
                // Nominatim prefere um User-Agent
                'User-Agent': 'YourAppName/1.0 (your-email@example.com)' // Substitua com o nome da sua aplicação e seu contato
             }
        });

        if (!response.ok) {
          console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
          throw new Error(`Geocoding API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          // Retorna a primeira correspondência encontrada
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } else {
          throw new Error(`Could not find coordinates for ${city}, ${state}`);
        }
      } catch (error: any) {
        console.error("Error fetching coordinates:", error);
        throw new Error(`Failed to get coordinates: ${error.message}`);
      }
    };

     // --- Determinar o fuso horário para as coordenadas e data/hora usando geo-tz ---
    const getTimezoneByCoordinatesAndDate = (lat: number, lon: number, date: string, time: string): string => {
        // Combinar data e hora para criar um objeto Date para consulta no geo-tz
         const dateTimeString = `${date}T${time}:00`; // Formato ISO 8601 parcial para Date
         const dateForTimezone = new Date(dateTimeString);

        // Usar geo-tz para encontrar o fuso horário IANA para as coordenadas e data/hora
        // A data/hora (timestamp) é importante para considerar regras históricas de DST.
        const timezones = findTimeZone.find(lat, lon, dateForTimezone.getTime()); // getTime() retorna timestamp em ms
        
        if (timezones && timezones.length > 0) {
            // Retorna o primeiro fuso horário encontrado para aquele ponto
            console.log(`Timezone found for ${lat}, ${lon} on ${date} ${time}: ${timezones[0]}`);
            return timezones[0];
        } else {
            console.warn(`Could not find timezone for ${lat}, ${lon} on ${date} ${time}. Using default timezone.`);
            return DEFAULT_TIMEZONE; // Fallback para o fuso horário padrão
        }
    };


    // Obter coordenadas primeiro
    const { lat, lon } = await getCoordinates(city, state);

    // Em seguida, obter o fuso horário usando as coordenadas e a data/hora de nascimento
    const userTimezone = getTimezoneByCoordinatesAndDate(lat, lon, dob, time); 

    // 1. Converter data e hora de nascimento (local, fuso horário da cidade/estado) para Julian Day (JD) UTC.
    const calculateJulianDay = (date: string, time: string, timezone: string): number => {
      // Combinar data e hora para facilitar o parsing
      const dateTimeString = `${date} ${time}`;
      
      // Definir o formato esperado (ex: "YYYY-MM-DD HH:mm")
      const formatString = 'yyyy-MM-dd HH:mm';

      // Parsear a data e hora na timezone especificada
      // Passar new Date() como referenceDate é comum, mas a timezone é o importante para interpretação.
      const parsedDate = parse(dateTimeString, formatString, new Date(), { timeZone: timezone });

      // Converter a data e hora parseada para UTC
      const utcDate = zonedTimeToUtc(parsedDate, timezone);

       // Obter o offset UTC exato para esta data/hora e fuso horário, incluindo DST se aplicável
       // Embora swe_utc_to_jd lide com a conversão final para JD, determinar o ponto de partida UTC correto
       // a partir da data/hora local *e* fuso horário histórico/DST é onde date-fns-tz ajuda.
       // O offset em milissegundos
       // const timezoneOffsetMs = getTimezoneOffset(timezone, parsedDate); // Exemplo de como obter o offset
       // const timezoneOffsetHours = -timezoneOffsetMs / (1000 * 60 * 60); 

      // Usar swisseph function to convert UTC date components to Julian Day
      let gregflag = swisseph.SE_GREG_CAL; // Use Gregorian calendar
      let year_ut = utcDate.getUTCFullYear();
      let month_ut = utcDate.getUTCMonth() + 1; // swisseph expects 1-indexed month
      let day_ut = utcDate.getUTCDate();
      let hour_ut = utcDate.getUTCHours() + utcDate.getUTCMinutes()/60.0 + utcDate.getUTCSeconds()/3600.0;

      let jd_utc_result = swisseph.swe_utc_to_jd(year_ut, month_ut, day_ut, hour_ut, gregflag);

      // swe_utc_to_jd returns an array [return_code, jd_utc], we need the jd_utc value
      if (jd_utc_result[0] < 0) {
           console.error("Error converting UTC date to Julian Day:", jd_utc_result[1]); // jd_utc_result[1] contains error message if code < 0
           throw new Error("Failed to convert date to Julian Day.");
      }

      return jd_utc_result[1]; // Return the calculated Julian Day (UTC)
    };


    const geoAlt = 0; // Altitude, assumindo 0 por enquanto

    // Set the path for ephemeris files (adjust path if necessary)
    // swisseph.swe_set_ephe_path('/path/to/your/ephe/files'); 
    // Note: You might need to include the ephemeris files in your deployment.
    // Ensure the ephemeris files are accessible from where your API route runs.
    // Consider using environment variables for the ephemeris path.

    let serr = Buffer.alloc(256);
    // Buffers for swisseph results - adjust sizes based on what you calculate and swisseph docs
    let xp = Buffer.alloc(20 * 6 * 8); // Buffer example for up to 20 bodies, 6 doubles each (lon, lat, dist, speed_lon, speed_lat, speed_dist)
    let cusps = Buffer.alloc(13 * 8); // Buffer for 12 house cusps + possibly Asc/MC depending on call
    let ascmc = Buffer.alloc(10 * 8); // Buffer for Asc, MC, Vertex, etc.

    // --- Usando swisseph para calcular posições planetárias ---
    const flags = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_NONUT;

    const bodiesToCalculate = [
        swisseph.SE_SUN, swisseph.SE_MOON, swisseph.SE_MERCURY, swisseph.SE_VENUS, 
        swisseph.SE_MARS, swisseph.SE_JUPITER, swisseph.SE_SATURN, swisseph.SE_URANUS, 
        swisseph.SE_NEPTUNE, swisseph.SE_PLUTO,
        swisseph.SE_TRUE_NODE, // Nodo Norte Verdadeiro
        // swisseph.SE_MEAN_NODE, // Nodo Norte Médio (escolha um ou outro)
        // swisseph.SE_CHIRON, // Quíron (se disponível nos seus arquivos ephemeris)
        // swisseph.SE_LILITH, // Lilith (se disponível)
    ];

    const calculatedBodies: any = {};
    const bodyPositions: { id: number, name: string, longitude: number }[] = [];

    for (const bodyId of bodiesToCalculate) {
        let body_serr = Buffer.alloc(256);
        let ret = swisseph.swe_calc_ut(julianDay, bodyId, flags, xp, body_serr);
        
        if (ret < 0) {
            console.error(`Swisseph error calculating body ${bodyId}: ${body_serr.toString()}`);
            calculatedBodies[swisseph.swe_get_planet_name(bodyId)] = { error: body_serr.toString() };
        } else {
             // ### VALIDE ESTES OFFSETS COM A DOCUMENTAÇÃO DO BINDING SWISSEPH PARA NODE.JS ###
             // A leitura de 6 doubles (48 bytes) por corpo é padrão, mas confirme a ordem e o que cada double representa.
             const offset = bodiesToCalculate.indexOf(bodyId) * 6 * 8; 
             const longitude = xp.readDoubleLE(offset);
             const latitude = xp.readDoubleLE(offset + 8);
             const distance = xp.readDoubleLE(offset + 16);
             const speedLongitude = xp.readDoubleLE(offset + 24); 
             const speedLatitude = xp.readDoubleLE(offset + 32);  
             const speedDistance = xp.readDoubleLE(offset + 40); 

             const bodyName = swisseph.swe_get_planet_name(bodyId);
             calculatedBodies[bodyName] = {
                 longitude,
                 latitude,
                 distance,
                 speedLongitude,
                 speedLatitude,
                 speedDistance,
             };
             bodyPositions.push({ id: bodyId, name: bodyName, longitude });
        }
    }

    // --- Usando swisseph para calcular casas e ângulos ---
    let hret_ex = swisseph.swe_houses_ex(julianDay, flags, lat, lon, 'P', ascmc, cusps, serr);

     if (hret_ex < 0) {
         console.error(`Swisseph error calculating houses: ${serr.toString()}`);
         throw new Error("Failed to calculate astrological houses.");
    }

    // Processar os resultados das casas e ângulos
    // ### VALIDE ESTES OFFSETS E O TAMANHO DO BUFFER ascmc COM A DOCUMENTAÇÃO DO BINDING SWISSEPH PARA NODE.JS ###
    // A leitura de 12 cúspides sequenciais em cusps (12 * 8 bytes) é comum.
    // Os offsets para Ascendente e Meio do Céu em ascmc (0 e 8) são prováveis, mas CONFIRME.
    const houseCuspsRaw = Array(12).fill(0).map((_, i) => cusps.readDoubleLE(i * 8)); // Cúspides brutas
    const ascendantRaw = ascmc.readDoubleLE(0); 
    const mcRaw = ascmc.readDoubleLE(8); 

    // Adicionar Ascendente e Meio do Céu às posições para cálculo de aspectos
     bodyPositions.push({ id: -1, name: 'Ascendente', longitude: ascendantRaw }); 
     bodyPositions.push({ id: -2, name: 'Meio do Céu', longitude: mcRaw }); 
     // Pode adicionar outros ângulos de ascmc aqui se necessário (validando os offsets na documentação)

    // --- Interpretar posições de corpos celestes e casas ---
    const interpretedBodies: any = {};
    for (const bodyName in calculatedBodies) {
        if (calculatedBodies[bodyName].longitude !== undefined) {
             const { longitude } = calculatedBodies[bodyName];
             const signAndDegree = getSignAndDegree(longitude);
             const house = getHouse(longitude, houseCuspsRaw);

             interpretedBodies[bodyName] = {
                 ...calculatedBodies[bodyName], // Manter dados brutos se necessário
                 sign: signAndDegree.sign,
                 degreeInSign: signAndDegree.degree,
                 minuteInSign: signAndDegree.minute,
                 secondInSign: signAndDegree.second,
                 house: house,
             };
        } else {
             interpretedBodies[bodyName] = calculatedBodies[bodyName]; // Manter erro se houver
        }
    }

     // --- Interpretar cúspides das casas e ângulos (Asc/MC) ---
     const interpretedHouses: any = {};
     houseCuspsRaw.forEach((cuspLon, index) => {
         const houseNumber = index + 1; // Casas são 1-indexadas
         const signAndDegree = getSignAndDegree(cuspLon);
         interpretedHouses[houseNumber] = {
             cuspLongitude: cuspLon,
             sign: signAndDegree.sign,
             degreeInSign: signAndDegree.degree,
             minuteInSign: signAndDegree.minute,
             secondInSign: signAndDegree.second,
         };
     });

     const interpretedAngles = {
        ascendant: { 
            longitude: ascendantRaw,
            ...getSignAndDegree(ascendantRaw),
            // Você pode determinar a casa do Ascendente/MC se necessário, mas geralmente eles definem as casas 1 e 10.
        },
         mc: {
             longitude: mcRaw,
             ...getSignAndDegree(mcRaw),
         }
         // Adicionar outros ângulos interpretados aqui
     };


    // --- Calcular Aspectos ---
    const calculatedAspects: any[] = [];

    // Iterar sobre todos os pares de corpos/ângulos calculados
    for (let i = 0; i < bodyPositions.length; i++) {
        for (let j = i + 1; j < bodyPositions.length; j++) { // Começa de i + 1 para evitar duplicatas e auto-comparação
            const body1 = bodyPositions[i];
            const body2 = bodyPositions[j];

            let diff = Math.abs(body1.longitude - body2.longitude);

            // Normalizar a diferença para estar entre 0 e 180 graus
            if (diff > 180) {
                diff = 360 - diff;
            }

            // Verificar cada tipo de aspecto
            for (const aspectName in ASPECTS) {
                const aspectDegree = ASPECTS[aspectName as keyof typeof ASPECTS];
                const orb = getOrb(aspectName, body1.name, body2.name); // Usar a função getOrb

                // Verificar se a diferença está dentro da orbe do aspecto
                if (Math.abs(diff - aspectDegree) <= orb) {
                    calculatedAspects.push({
                        body1: body1.name,
                        body2: body2.name,
                        aspect: aspectName.toLowerCase(), // Nome do aspecto em minúsculas
                        degree: diff, // A diferença exata
                        orb: Math.abs(diff - aspectDegree), // A diferença exata da orbe para este aspecto/pares
                        aspectDegree: aspectDegree // O ângulo exato do aspecto
                    });
                }
            }
        }
    }

    // ===============================================================
    // FIM DA LÓGICA DE CÁLCULO
    // ===============================================================

    // Resultado contendo os dados calculados E interpretados
    const horoscopeData = {
      message: "Mapa astral calculado e interpretado.",
      userData: { name, dob, time, city, state, timezone: userTimezone }, 
      calculatedMap: {
        // Dados brutos (opcional, pode remover se não precisar no frontend)
        // raw: { 
        //     julianDay: julianDay,
        //     coordinates: { lat, lon, geoAlt },
        //     bodies: calculatedBodies, 
        //     houses: houseCuspsRaw, 
        //     ascendant: ascendantRaw,
        //     mc: mcRaw,
        // },
        // Dados Interpretados
        interpreted: {
             bodies: interpretedBodies, // Posições dos corpos celestes em signo/grau e casa
             houses: interpretedHouses, // Cúspides das casas em signo/grau
             angles: interpretedAngles, // Ascendente/MC em signo/grau
             aspects: calculatedAspects, // Aspectos calculados
        }
      }
    };

    return res.status(200).json(horoscopeData);

  } catch (error: any) {
    console.error("Erro ao processar solicitação:", error);
    // Em caso de erro na swisseph, serr pode conter informações
    if (serr && serr.toString().trim() !== '') {
        console.error("Swiss Ephemeris Error (serr):", serr.toString());
    }
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
