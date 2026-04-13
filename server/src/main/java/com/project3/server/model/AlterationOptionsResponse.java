package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Response object for cashier/customer modification options.
 * @author Rylee Hunt
 */
public class AlterationOptionsResponse {

    private List<Modification> defaults = new ArrayList<>();
    private List<Modification> sweetness = new ArrayList<>();
    private List<Modification> ice = new ArrayList<>();

    public AlterationOptionsResponse() {
    }

    public AlterationOptionsResponse(List<Modification> defaults,
                                     List<Modification> sweetness,
                                     List<Modification> ice) {
        this.defaults = defaults != null ? defaults : new ArrayList<>();
        this.sweetness = sweetness != null ? sweetness : new ArrayList<>();
        this.ice = ice != null ? ice : new ArrayList<>();
    }

    public List<Modification> getDefaults() {
        return defaults;
    }

    public void setDefaults(List<Modification> defaults) {
        this.defaults = defaults != null ? defaults : new ArrayList<>();
    }

    public List<Modification> getSweetness() {
        return sweetness;
    }

    public void setSweetness(List<Modification> sweetness) {
        this.sweetness = sweetness != null ? sweetness : new ArrayList<>();
    }

    public List<Modification> getIce() {
        return ice;
    }

    public void setIce(List<Modification> ice) {
        this.ice = ice != null ? ice : new ArrayList<>();
    }
}