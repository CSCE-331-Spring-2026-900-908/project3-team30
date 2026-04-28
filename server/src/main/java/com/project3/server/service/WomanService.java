package com.project3.server.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;

@Service
public class WomanService {
    RestTemplate restTemplate = new RestTemplate();

    //list blocked occupation terms
    private static final Set<String> BLOCKED_TERMS = Set.of(
    "porn", "adult film", "adult model", "erotic", "onlyfans", "sex", "war criminal",
                 "concentration camp","neo-nazi", "model","perpetrator","adult actress", "actress"
    );
    
    //call to fetch for site
    public Map<String, Object> fetchRandomWoman() {
        //try up to 10 times
        for (int attempt = 0; attempt < 10; attempt++) {
            Map<String, Object> result = fetchOneRandomWoman();
            if (isAppropriate(result)) {
                return result;
            }
        }
        // fallback after attempts
        
        Map<String, Object> errorMap = new HashMap<>();
        errorMap.put("name", "Error");
        errorMap.put("fact", "Could not fetch a result.");
        errorMap.put("image", null);
        return errorMap;
    }

    //checks for blocked terms in fact/name
    private boolean isAppropriate(Map<String, Object> result) {
        String fact = result.getOrDefault("fact", "").toString().toLowerCase();
        String name = result.getOrDefault("name", "").toString().toLowerCase();
        if (name.matches("q\\d+")) {
            return false; //exclude invalid names (qids)
        }
        return BLOCKED_TERMS.stream().noneMatch(term -> 
            fact.contains(term) || name.contains(term)
        );
    }

    public Map<String, Object> fetchOneRandomWoman() {
        try {
            String query = """
                SELECT ?person ?personLabel ?description ?image WHERE {
                {
                    SELECT ?person ?image WHERE {
                    ?person wdt:P31 wd:Q5 ;
                            wdt:P21 wd:Q6581072 ;
                            wdt:P18 ?image ;
                            wikibase:sitelinks ?links .
                    FILTER(?links > 20)
                    
                    }
                    LIMIT 1
                    OFFSET %d
                }
                OPTIONAL { ?person schema:description ?description .
                            FILTER(LANG(?description) = "en") }
                SERVICE wikibase:label {
                    bd:serviceParam wikibase:language "en" .
                }
                }
                
            """.formatted((int)(Math.random() * 7000));

            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WomanCardApp/1.0 (nityakhurana@tamu.edu)");
            headers.set("Accept", "application/sparql-results+json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            URI uri = UriComponentsBuilder
                .newInstance()
                .scheme("https")
                .host("query.wikidata.org")
                .path("/sparql")
                .queryParam("format", "json")
                .queryParam("query", query)
                .build()
                .toUri();

            ResponseEntity<Map> responseEntity =
                    restTemplate.exchange(uri, HttpMethod.GET, entity, Map.class);

            Map response = responseEntity.getBody();

            List<Map> bindings =
                    (List<Map>) ((Map) response.get("results")).get("bindings");

            if (bindings == null || bindings.isEmpty()) {
                throw new RuntimeException("No results returned");
            }

            Map result = bindings.get(0);

            String name = ((Map) result.get("personLabel")).get("value").toString();

            String fact = result.containsKey("description")
                    ? ((Map) result.get("description")).get("value").toString()
                    : "No description available.";

            String image = result.containsKey("image")
                    ? ((Map) result.get("image")).get("value").toString()
                    : null;

            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("name", name);
            resultMap.put("fact", fact);
            resultMap.put("image", image);

            return resultMap;

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("name", "Error");
            errorMap.put("fact", "Failed to fetch data: " + e.getMessage());
            errorMap.put("image", null);
            return errorMap;
        }
    }
}