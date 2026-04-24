package com.project3.server.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class WomanService {

    public Map<String, Object> fetchRandomWoman() {
        try {
            String query = """
                SELECT ?person ?personLabel ?description ?image WHERE {
                {
                    SELECT ?person ?image WHERE {
                    ?person wdt:P31 wd:Q5 ;
                            wdt:P21 wd:Q6581072 ;
                            wdt:P18 ?image ;
                            wikibase:sitelinks ?links .
                    FILTER(?links > 2)
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
                
            """.formatted((int)(Math.random() * 10000));

            RestTemplate restTemplate = new RestTemplate();
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