package org.traffictrender.worker;

public class Statistics {
    private float min, max, average, sd;

    public float getMin() {
	return this.min;
    }

    public void setMin(float min) {
	this.min = min;
    }

    public float getMax() {
	return this.max;
    }

    public void setMax(float max) {
	this.max = max;
    }

    public float getAverage() {
	return this.average;
    }

    public void setAverage(float ave) {
	this.average = ave;
    }

    public float getSD() {
	return this.sd;
    }

    public void setSD(float sd) {
	this.sd = sd;
    }

    public Statistics(float max, float min, float average, float sd) {
	this.max = max;
	this.min = min;
	this.sd = sd;	
	this.average = average;
    }

    public Statistics() {
	this.max = 0;
	this.min = 0;
	this.sd = 0;	
	this.average = 0;
    }
}
