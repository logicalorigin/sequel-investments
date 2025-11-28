#!/usr/bin/env python3
"""
Generate state SVG outlines with metro dots for the Top Markets section.
Uses geopandas with US Census state boundaries.
"""

import geopandas as gpd
import svgwrite
from shapely.geometry import Point, Polygon, MultiPolygon
from shapely.affinity import translate, scale
import json
import os
import requests
import zipfile
import io

OUTPUT_DIR = "attached_assets/state_maps"

STATE_METROS = {
    "alabama": [
        {"name": "Birmingham", "lat": 33.5207, "lng": -86.8025, "rank": 1},
        {"name": "Huntsville", "lat": 34.7304, "lng": -86.5861, "rank": 2},
        {"name": "Mobile", "lat": 30.6954, "lng": -88.0399, "rank": 3},
        {"name": "Montgomery", "lat": 32.3792, "lng": -86.3077, "rank": 4},
    ],
    "alaska": [
        {"name": "Anchorage", "lat": 61.2181, "lng": -149.9003, "rank": 1},
        {"name": "Fairbanks", "lat": 64.8378, "lng": -147.7164, "rank": 2},
        {"name": "Juneau", "lat": 58.3019, "lng": -134.4197, "rank": 3},
    ],
    "arizona": [
        {"name": "Phoenix", "lat": 33.4484, "lng": -112.0740, "rank": 1},
        {"name": "Tucson", "lat": 32.2226, "lng": -110.9747, "rank": 2},
        {"name": "Scottsdale", "lat": 33.4942, "lng": -111.9261, "rank": 3},
        {"name": "Mesa", "lat": 33.4152, "lng": -111.8315, "rank": 4},
        {"name": "Chandler", "lat": 33.3062, "lng": -111.8413, "rank": 5},
    ],
    "arkansas": [
        {"name": "Little Rock", "lat": 34.7465, "lng": -92.2896, "rank": 1},
        {"name": "Fayetteville", "lat": 36.0626, "lng": -94.1574, "rank": 2},
        {"name": "Fort Smith", "lat": 35.3859, "lng": -94.3985, "rank": 3},
        {"name": "Bentonville", "lat": 36.3729, "lng": -94.2088, "rank": 4},
    ],
    "california": [
        {"name": "Los Angeles", "lat": 34.0522, "lng": -118.2437, "rank": 1},
        {"name": "San Francisco", "lat": 37.7749, "lng": -122.4194, "rank": 2},
        {"name": "San Diego", "lat": 32.7157, "lng": -117.1611, "rank": 3},
        {"name": "Sacramento", "lat": 38.5816, "lng": -121.4944, "rank": 4},
        {"name": "San Jose", "lat": 37.3382, "lng": -121.8863, "rank": 5},
        {"name": "Fresno", "lat": 36.7378, "lng": -119.7871, "rank": 6},
    ],
    "colorado": [
        {"name": "Denver", "lat": 39.7392, "lng": -104.9903, "rank": 1},
        {"name": "Colorado Springs", "lat": 38.8339, "lng": -104.8214, "rank": 2},
        {"name": "Aurora", "lat": 39.7294, "lng": -104.8319, "rank": 3},
        {"name": "Boulder", "lat": 40.0150, "lng": -105.2705, "rank": 4},
        {"name": "Fort Collins", "lat": 40.5853, "lng": -105.0844, "rank": 5},
    ],
    "connecticut": [
        {"name": "Hartford", "lat": 41.7658, "lng": -72.6734, "rank": 1},
        {"name": "New Haven", "lat": 41.3083, "lng": -72.9279, "rank": 2},
        {"name": "Stamford", "lat": 41.0534, "lng": -73.5387, "rank": 3},
        {"name": "Bridgeport", "lat": 41.1865, "lng": -73.1952, "rank": 4},
    ],
    "delaware": [
        {"name": "Wilmington", "lat": 39.7391, "lng": -75.5398, "rank": 1},
        {"name": "Dover", "lat": 39.1582, "lng": -75.5244, "rank": 2},
        {"name": "Newark", "lat": 39.6837, "lng": -75.7497, "rank": 3},
    ],
    "florida": [
        {"name": "Miami", "lat": 25.7617, "lng": -80.1918, "rank": 1},
        {"name": "Orlando", "lat": 28.5383, "lng": -81.3792, "rank": 2},
        {"name": "Tampa", "lat": 27.9506, "lng": -82.4572, "rank": 3},
        {"name": "Jacksonville", "lat": 30.3322, "lng": -81.6557, "rank": 4},
        {"name": "Fort Lauderdale", "lat": 26.1224, "lng": -80.1373, "rank": 5},
        {"name": "West Palm Beach", "lat": 26.7153, "lng": -80.0534, "rank": 6},
    ],
    "georgia": [
        {"name": "Atlanta", "lat": 33.7490, "lng": -84.3880, "rank": 1},
        {"name": "Savannah", "lat": 32.0809, "lng": -81.0912, "rank": 2},
        {"name": "Augusta", "lat": 33.4735, "lng": -82.0105, "rank": 3},
        {"name": "Columbus", "lat": 32.4610, "lng": -84.9877, "rank": 4},
        {"name": "Athens", "lat": 33.9519, "lng": -83.3576, "rank": 5},
    ],
    "hawaii": [
        {"name": "Honolulu", "lat": 21.3069, "lng": -157.8583, "rank": 1},
        {"name": "Maui", "lat": 20.7984, "lng": -156.3319, "rank": 2},
        {"name": "Kona", "lat": 19.6400, "lng": -155.9969, "rank": 3},
    ],
    "idaho": [
        {"name": "Boise", "lat": 43.6150, "lng": -116.2023, "rank": 1},
        {"name": "Meridian", "lat": 43.6121, "lng": -116.3915, "rank": 2},
        {"name": "Idaho Falls", "lat": 43.4666, "lng": -112.0341, "rank": 3},
        {"name": "Coeur d'Alene", "lat": 47.6777, "lng": -116.7805, "rank": 4},
    ],
    "illinois": [
        {"name": "Chicago", "lat": 41.8781, "lng": -87.6298, "rank": 1},
        {"name": "Aurora", "lat": 41.7606, "lng": -88.3201, "rank": 2},
        {"name": "Naperville", "lat": 41.7508, "lng": -88.1535, "rank": 3},
        {"name": "Springfield", "lat": 39.7817, "lng": -89.6501, "rank": 4},
        {"name": "Rockford", "lat": 42.2711, "lng": -89.0940, "rank": 5},
    ],
    "indiana": [
        {"name": "Indianapolis", "lat": 39.7684, "lng": -86.1581, "rank": 1},
        {"name": "Fort Wayne", "lat": 41.0793, "lng": -85.1394, "rank": 2},
        {"name": "Evansville", "lat": 37.9716, "lng": -87.5711, "rank": 3},
        {"name": "South Bend", "lat": 41.6764, "lng": -86.2520, "rank": 4},
        {"name": "Carmel", "lat": 39.9784, "lng": -86.1180, "rank": 5},
    ],
    "iowa": [
        {"name": "Des Moines", "lat": 41.5868, "lng": -93.6250, "rank": 1},
        {"name": "Cedar Rapids", "lat": 41.9779, "lng": -91.6656, "rank": 2},
        {"name": "Davenport", "lat": 41.5236, "lng": -90.5776, "rank": 3},
        {"name": "Iowa City", "lat": 41.6611, "lng": -91.5302, "rank": 4},
    ],
    "kansas": [
        {"name": "Wichita", "lat": 37.6872, "lng": -97.3301, "rank": 1},
        {"name": "Overland Park", "lat": 38.9822, "lng": -94.6708, "rank": 2},
        {"name": "Kansas City", "lat": 39.1155, "lng": -94.6268, "rank": 3},
        {"name": "Topeka", "lat": 39.0473, "lng": -95.6752, "rank": 4},
    ],
    "kentucky": [
        {"name": "Louisville", "lat": 38.2527, "lng": -85.7585, "rank": 1},
        {"name": "Lexington", "lat": 38.0406, "lng": -84.5037, "rank": 2},
        {"name": "Bowling Green", "lat": 36.9685, "lng": -86.4808, "rank": 3},
        {"name": "Covington", "lat": 39.0837, "lng": -84.5086, "rank": 4},
    ],
    "louisiana": [
        {"name": "New Orleans", "lat": 29.9511, "lng": -90.0715, "rank": 1},
        {"name": "Baton Rouge", "lat": 30.4515, "lng": -91.1871, "rank": 2},
        {"name": "Shreveport", "lat": 32.5252, "lng": -93.7502, "rank": 3},
        {"name": "Lafayette", "lat": 30.2241, "lng": -92.0198, "rank": 4},
    ],
    "maine": [
        {"name": "Portland", "lat": 43.6591, "lng": -70.2568, "rank": 1},
        {"name": "Lewiston", "lat": 44.1004, "lng": -70.2148, "rank": 2},
        {"name": "Bangor", "lat": 44.8016, "lng": -68.7712, "rank": 3},
    ],
    "maryland": [
        {"name": "Baltimore", "lat": 39.2904, "lng": -76.6122, "rank": 1},
        {"name": "Columbia", "lat": 39.2037, "lng": -76.8610, "rank": 2},
        {"name": "Silver Spring", "lat": 38.9907, "lng": -77.0261, "rank": 3},
        {"name": "Bethesda", "lat": 38.9847, "lng": -77.0947, "rank": 4},
    ],
    "massachusetts": [
        {"name": "Boston", "lat": 42.3601, "lng": -71.0589, "rank": 1},
        {"name": "Cambridge", "lat": 42.3736, "lng": -71.1097, "rank": 2},
        {"name": "Worcester", "lat": 42.2626, "lng": -71.8023, "rank": 3},
        {"name": "Springfield", "lat": 42.1015, "lng": -72.5898, "rank": 4},
    ],
    "michigan": [
        {"name": "Detroit", "lat": 42.3314, "lng": -83.0458, "rank": 1},
        {"name": "Grand Rapids", "lat": 42.9634, "lng": -85.6681, "rank": 2},
        {"name": "Ann Arbor", "lat": 42.2808, "lng": -83.7430, "rank": 3},
        {"name": "Lansing", "lat": 42.7325, "lng": -84.5555, "rank": 4},
        {"name": "Traverse City", "lat": 44.7631, "lng": -85.6206, "rank": 5},
    ],
    "minnesota": [
        {"name": "Minneapolis", "lat": 44.9778, "lng": -93.2650, "rank": 1},
        {"name": "St. Paul", "lat": 44.9537, "lng": -93.0900, "rank": 2},
        {"name": "Rochester", "lat": 44.0121, "lng": -92.4802, "rank": 3},
        {"name": "Duluth", "lat": 46.7867, "lng": -92.1005, "rank": 4},
    ],
    "mississippi": [
        {"name": "Jackson", "lat": 32.2988, "lng": -90.1848, "rank": 1},
        {"name": "Gulfport", "lat": 30.3674, "lng": -89.0928, "rank": 2},
        {"name": "Biloxi", "lat": 30.3960, "lng": -88.8853, "rank": 3},
        {"name": "Hattiesburg", "lat": 31.3271, "lng": -89.2903, "rank": 4},
    ],
    "missouri": [
        {"name": "Kansas City", "lat": 39.0997, "lng": -94.5786, "rank": 1},
        {"name": "St. Louis", "lat": 38.6270, "lng": -90.1994, "rank": 2},
        {"name": "Springfield", "lat": 37.2090, "lng": -93.2923, "rank": 3},
        {"name": "Columbia", "lat": 38.9517, "lng": -92.3341, "rank": 4},
    ],
    "montana": [
        {"name": "Billings", "lat": 45.7833, "lng": -108.5007, "rank": 1},
        {"name": "Missoula", "lat": 46.8721, "lng": -113.9940, "rank": 2},
        {"name": "Bozeman", "lat": 45.6770, "lng": -111.0429, "rank": 3},
        {"name": "Great Falls", "lat": 47.5002, "lng": -111.3008, "rank": 4},
    ],
    "nebraska": [
        {"name": "Omaha", "lat": 41.2565, "lng": -95.9345, "rank": 1},
        {"name": "Lincoln", "lat": 40.8258, "lng": -96.6852, "rank": 2},
        {"name": "Bellevue", "lat": 41.1544, "lng": -95.9146, "rank": 3},
    ],
    "nevada": [
        {"name": "Las Vegas", "lat": 36.1699, "lng": -115.1398, "rank": 1},
        {"name": "Henderson", "lat": 36.0395, "lng": -114.9817, "rank": 2},
        {"name": "Reno", "lat": 39.5296, "lng": -119.8138, "rank": 3},
        {"name": "North Las Vegas", "lat": 36.1989, "lng": -115.1175, "rank": 4},
        {"name": "Sparks", "lat": 39.5349, "lng": -119.7527, "rank": 5},
    ],
    "new-hampshire": [
        {"name": "Manchester", "lat": 42.9956, "lng": -71.4548, "rank": 1},
        {"name": "Nashua", "lat": 42.7654, "lng": -71.4676, "rank": 2},
        {"name": "Concord", "lat": 43.2081, "lng": -71.5376, "rank": 3},
    ],
    "new-jersey": [
        {"name": "Newark", "lat": 40.7357, "lng": -74.1724, "rank": 1},
        {"name": "Jersey City", "lat": 40.7178, "lng": -74.0431, "rank": 2},
        {"name": "Trenton", "lat": 40.2206, "lng": -74.7597, "rank": 3},
        {"name": "Atlantic City", "lat": 39.3643, "lng": -74.4229, "rank": 4},
        {"name": "Cherry Hill", "lat": 39.9348, "lng": -75.0307, "rank": 5},
    ],
    "new-mexico": [
        {"name": "Albuquerque", "lat": 35.0844, "lng": -106.6504, "rank": 1},
        {"name": "Santa Fe", "lat": 35.6870, "lng": -105.9378, "rank": 2},
        {"name": "Las Cruces", "lat": 32.3199, "lng": -106.7637, "rank": 3},
        {"name": "Rio Rancho", "lat": 35.2328, "lng": -106.6630, "rank": 4},
    ],
    "new-york": [
        {"name": "New York City", "lat": 40.7128, "lng": -74.0060, "rank": 1},
        {"name": "Buffalo", "lat": 42.8864, "lng": -78.8784, "rank": 2},
        {"name": "Rochester", "lat": 43.1566, "lng": -77.6088, "rank": 3},
        {"name": "Albany", "lat": 42.6526, "lng": -73.7562, "rank": 4},
        {"name": "Syracuse", "lat": 43.0481, "lng": -76.1474, "rank": 5},
    ],
    "north-carolina": [
        {"name": "Charlotte", "lat": 35.2271, "lng": -80.8431, "rank": 1},
        {"name": "Raleigh", "lat": 35.7796, "lng": -78.6382, "rank": 2},
        {"name": "Durham", "lat": 35.9940, "lng": -78.8986, "rank": 3},
        {"name": "Greensboro", "lat": 36.0726, "lng": -79.7920, "rank": 4},
        {"name": "Winston-Salem", "lat": 36.0999, "lng": -80.2442, "rank": 5},
        {"name": "Asheville", "lat": 35.5951, "lng": -82.5515, "rank": 6},
    ],
    "north-dakota": [
        {"name": "Fargo", "lat": 46.8772, "lng": -96.7898, "rank": 1},
        {"name": "Bismarck", "lat": 46.8083, "lng": -100.7837, "rank": 2},
        {"name": "Grand Forks", "lat": 47.9253, "lng": -97.0329, "rank": 3},
    ],
    "ohio": [
        {"name": "Columbus", "lat": 39.9612, "lng": -82.9988, "rank": 1},
        {"name": "Cleveland", "lat": 41.4993, "lng": -81.6944, "rank": 2},
        {"name": "Cincinnati", "lat": 39.1031, "lng": -84.5120, "rank": 3},
        {"name": "Toledo", "lat": 41.6528, "lng": -83.5379, "rank": 4},
        {"name": "Akron", "lat": 41.0814, "lng": -81.5190, "rank": 5},
    ],
    "oklahoma": [
        {"name": "Oklahoma City", "lat": 35.4676, "lng": -97.5164, "rank": 1},
        {"name": "Tulsa", "lat": 36.1540, "lng": -95.9928, "rank": 2},
        {"name": "Norman", "lat": 35.2226, "lng": -97.4395, "rank": 3},
        {"name": "Edmond", "lat": 35.6528, "lng": -97.4781, "rank": 4},
    ],
    "oregon": [
        {"name": "Portland", "lat": 45.5152, "lng": -122.6784, "rank": 1},
        {"name": "Salem", "lat": 44.9429, "lng": -123.0351, "rank": 2},
        {"name": "Eugene", "lat": 44.0521, "lng": -123.0868, "rank": 3},
        {"name": "Bend", "lat": 44.0582, "lng": -121.3153, "rank": 4},
    ],
    "pennsylvania": [
        {"name": "Philadelphia", "lat": 39.9526, "lng": -75.1652, "rank": 1},
        {"name": "Pittsburgh", "lat": 40.4406, "lng": -79.9959, "rank": 2},
        {"name": "Allentown", "lat": 40.6084, "lng": -75.4902, "rank": 3},
        {"name": "Harrisburg", "lat": 40.2732, "lng": -76.8867, "rank": 4},
        {"name": "Lancaster", "lat": 40.0379, "lng": -76.3055, "rank": 5},
    ],
    "rhode-island": [
        {"name": "Providence", "lat": 41.8240, "lng": -71.4128, "rank": 1},
        {"name": "Warwick", "lat": 41.7001, "lng": -71.4162, "rank": 2},
        {"name": "Newport", "lat": 41.4901, "lng": -71.3128, "rank": 3},
    ],
    "south-carolina": [
        {"name": "Charleston", "lat": 32.7765, "lng": -79.9311, "rank": 1},
        {"name": "Columbia", "lat": 34.0007, "lng": -81.0348, "rank": 2},
        {"name": "Greenville", "lat": 34.8526, "lng": -82.3940, "rank": 3},
        {"name": "Myrtle Beach", "lat": 33.6891, "lng": -78.8867, "rank": 4},
    ],
    "south-dakota": [
        {"name": "Sioux Falls", "lat": 43.5446, "lng": -96.7311, "rank": 1},
        {"name": "Rapid City", "lat": 44.0805, "lng": -103.2310, "rank": 2},
        {"name": "Aberdeen", "lat": 45.4647, "lng": -98.4865, "rank": 3},
    ],
    "tennessee": [
        {"name": "Nashville", "lat": 36.1627, "lng": -86.7816, "rank": 1},
        {"name": "Memphis", "lat": 35.1495, "lng": -90.0490, "rank": 2},
        {"name": "Knoxville", "lat": 35.9606, "lng": -83.9207, "rank": 3},
        {"name": "Chattanooga", "lat": 35.0456, "lng": -85.3097, "rank": 4},
        {"name": "Clarksville", "lat": 36.5298, "lng": -87.3595, "rank": 5},
    ],
    "texas": [
        {"name": "Houston", "lat": 29.7604, "lng": -95.3698, "rank": 1},
        {"name": "Dallas", "lat": 32.7767, "lng": -96.7970, "rank": 2},
        {"name": "Austin", "lat": 30.2672, "lng": -97.7431, "rank": 3},
        {"name": "San Antonio", "lat": 29.4241, "lng": -98.4936, "rank": 4},
        {"name": "Fort Worth", "lat": 32.7555, "lng": -97.3308, "rank": 5},
        {"name": "El Paso", "lat": 31.7619, "lng": -106.4850, "rank": 6},
    ],
    "utah": [
        {"name": "Salt Lake City", "lat": 40.7608, "lng": -111.8910, "rank": 1},
        {"name": "Provo", "lat": 40.2338, "lng": -111.6585, "rank": 2},
        {"name": "Ogden", "lat": 41.2230, "lng": -111.9738, "rank": 3},
        {"name": "St. George", "lat": 37.0965, "lng": -113.5684, "rank": 4},
    ],
    "vermont": [
        {"name": "Burlington", "lat": 44.4759, "lng": -73.2121, "rank": 1},
        {"name": "South Burlington", "lat": 44.4669, "lng": -73.1710, "rank": 2},
        {"name": "Montpelier", "lat": 44.2601, "lng": -72.5754, "rank": 3},
    ],
    "virginia": [
        {"name": "Virginia Beach", "lat": 36.8529, "lng": -75.9780, "rank": 1},
        {"name": "Norfolk", "lat": 36.8508, "lng": -76.2859, "rank": 2},
        {"name": "Richmond", "lat": 37.5407, "lng": -77.4360, "rank": 3},
        {"name": "Arlington", "lat": 38.8816, "lng": -77.0910, "rank": 4},
        {"name": "Roanoke", "lat": 37.2710, "lng": -79.9414, "rank": 5},
    ],
    "washington": [
        {"name": "Seattle", "lat": 47.6062, "lng": -122.3321, "rank": 1},
        {"name": "Tacoma", "lat": 47.2529, "lng": -122.4443, "rank": 2},
        {"name": "Spokane", "lat": 47.6588, "lng": -117.4260, "rank": 3},
        {"name": "Bellevue", "lat": 47.6101, "lng": -122.2015, "rank": 4},
        {"name": "Vancouver", "lat": 45.6387, "lng": -122.6615, "rank": 5},
    ],
    "west-virginia": [
        {"name": "Charleston", "lat": 38.3498, "lng": -81.6326, "rank": 1},
        {"name": "Huntington", "lat": 38.4192, "lng": -82.4452, "rank": 2},
        {"name": "Morgantown", "lat": 39.6295, "lng": -79.9559, "rank": 3},
    ],
    "wisconsin": [
        {"name": "Milwaukee", "lat": 43.0389, "lng": -87.9065, "rank": 1},
        {"name": "Madison", "lat": 43.0731, "lng": -89.4012, "rank": 2},
        {"name": "Green Bay", "lat": 44.5133, "lng": -88.0133, "rank": 3},
        {"name": "Kenosha", "lat": 42.5847, "lng": -87.8212, "rank": 4},
    ],
    "wyoming": [
        {"name": "Cheyenne", "lat": 41.1400, "lng": -104.8202, "rank": 1},
        {"name": "Casper", "lat": 42.8501, "lng": -106.3252, "rank": 2},
        {"name": "Jackson", "lat": 43.4799, "lng": -110.7624, "rank": 3},
    ],
    "district-of-columbia": [
        {"name": "Washington", "lat": 38.9072, "lng": -77.0369, "rank": 1},
    ],
}

SLUG_TO_FIPS = {
    "alabama": "01", "alaska": "02", "arizona": "04", "arkansas": "05",
    "california": "06", "colorado": "08", "connecticut": "09", "delaware": "10",
    "florida": "12", "georgia": "13", "hawaii": "15", "idaho": "16",
    "illinois": "17", "indiana": "18", "iowa": "19", "kansas": "20",
    "kentucky": "21", "louisiana": "22", "maine": "23", "maryland": "24",
    "massachusetts": "25", "michigan": "26", "minnesota": "27", "mississippi": "28",
    "missouri": "29", "montana": "30", "nebraska": "31", "nevada": "32",
    "new-hampshire": "33", "new-jersey": "34", "new-mexico": "35", "new-york": "36",
    "north-carolina": "37", "north-dakota": "38", "ohio": "39", "oklahoma": "40",
    "oregon": "41", "pennsylvania": "42", "rhode-island": "44", "south-carolina": "45",
    "south-dakota": "46", "tennessee": "47", "texas": "48", "utah": "49",
    "vermont": "50", "virginia": "51", "washington": "53", "west-virginia": "54",
    "wisconsin": "55", "wyoming": "56", "district-of-columbia": "11"
}

STATE_NAMES = {
    "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas",
    "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware",
    "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii",
    "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa",
    "20": "Kansas", "21": "Kentucky", "22": "Louisiana", "23": "Maine",
    "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota",
    "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska",
    "32": "Nevada", "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico",
    "36": "New York", "37": "North Carolina", "38": "North Dakota", "39": "Ohio",
    "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island",
    "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas",
    "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington",
    "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming"
}


def download_states_shapefile():
    """Download US states shapefile from Census Bureau."""
    url = "https://www2.census.gov/geo/tiger/GENZ2021/shp/cb_2021_us_state_20m.zip"
    cache_dir = "scripts/cache"
    shapefile_path = os.path.join(cache_dir, "cb_2021_us_state_20m.shp")
    
    if os.path.exists(shapefile_path):
        print("Using cached shapefile...")
        return shapefile_path
    
    print("Downloading states shapefile...")
    os.makedirs(cache_dir, exist_ok=True)
    
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        z.extractall(cache_dir)
    
    return shapefile_path


def geometry_to_svg_path(geometry, min_x, min_y, scale_x, scale_y, height):
    """Convert a shapely geometry to SVG path string."""
    paths = []
    
    if geometry.geom_type == 'Polygon':
        polygons = [geometry]
    elif geometry.geom_type == 'MultiPolygon':
        polygons = list(geometry.geoms)
    else:
        return ""
    
    for polygon in polygons:
        exterior = polygon.exterior.coords
        path_parts = []
        for i, (x, y) in enumerate(exterior):
            svg_x = (x - min_x) * scale_x
            svg_y = height - (y - min_y) * scale_y
            if i == 0:
                path_parts.append(f"M {svg_x:.2f} {svg_y:.2f}")
            else:
                path_parts.append(f"L {svg_x:.2f} {svg_y:.2f}")
        path_parts.append("Z")
        paths.append(" ".join(path_parts))
    
    return " ".join(paths)


def transform_point(lng, lat, min_x, min_y, scale_x, scale_y, height):
    """Transform lat/lng to SVG coordinates."""
    svg_x = (lng - min_x) * scale_x
    svg_y = height - (lat - min_y) * scale_y
    return svg_x, svg_y


def generate_state_svg(state_geometry, state_slug, metros, width=400, height=300, padding=20):
    """Generate an SVG for a state with metro dots (raw SVG string)."""
    bounds = state_geometry.bounds
    min_x, min_y, max_x, max_y = bounds
    
    geo_width = max_x - min_x
    geo_height = max_y - min_y
    
    available_width = width - 2 * padding
    available_height = height - 2 * padding
    
    scale = min(available_width / geo_width, available_height / geo_height)
    scale_x = scale
    scale_y = scale
    
    scaled_width = geo_width * scale
    scaled_height = geo_height * scale
    
    offset_x = (width - scaled_width) / 2
    offset_y = (height - scaled_height) / 2
    
    state_path = geometry_to_svg_path(
        state_geometry, 
        min_x, min_y, 
        scale_x, scale_y, 
        height
    )
    
    shift_x = offset_x - padding * scale_x / scale
    shift_y = -(offset_y - padding * scale_y / scale)
    
    svg_parts = []
    svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" class="state-outline-svg">')
    
    svg_parts.append(f'  <path d="{state_path}" fill="none" stroke="currentColor" stroke-width="2" opacity="0.8" class="state-boundary" transform="translate({shift_x:.2f}, {shift_y:.2f})"/>')
    
    for metro in metros:
        svg_x, svg_y = transform_point(
            metro['lng'], metro['lat'],
            min_x, min_y,
            scale_x, scale_y,
            height
        )
        
        svg_x += shift_x
        svg_y += shift_y
        
        dot_radius = 8 - (metro['rank'] - 1) * 1.2
        dot_radius = max(dot_radius, 4)
        
        svg_parts.append(f'  <circle cx="{svg_x:.2f}" cy="{svg_y:.2f}" r="{dot_radius + 4:.1f}" fill="currentColor" opacity="0.2" class="metro-pulse rank-{metro["rank"]}"/>')
        
        svg_parts.append(f'  <circle cx="{svg_x:.2f}" cy="{svg_y:.2f}" r="{dot_radius:.1f}" fill="currentColor" opacity="0.9" class="metro-dot rank-{metro["rank"]}" data-city="{metro["name"]}" data-rank="{metro["rank"]}"/>')
    
    svg_parts.append('</svg>')
    
    return '\n'.join(svg_parts)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    shapefile_path = download_states_shapefile()
    states_gdf = gpd.read_file(shapefile_path)
    
    print(f"Loaded {len(states_gdf)} states/territories")
    
    generated_count = 0
    
    for state_slug, fips in SLUG_TO_FIPS.items():
        state_row = states_gdf[states_gdf['STATEFP'] == fips]
        
        if state_row.empty:
            print(f"Warning: No geometry found for {state_slug} (FIPS: {fips})")
            continue
        
        geometry = state_row.iloc[0].geometry
        metros = STATE_METROS.get(state_slug, [])
        
        if not metros:
            print(f"Warning: No metros defined for {state_slug}")
            continue
        
        svg_content = generate_state_svg(geometry, state_slug, metros)
        
        output_path = os.path.join(OUTPUT_DIR, f"{state_slug}.svg")
        with open(output_path, 'w') as f:
            f.write(svg_content)
        
        print(f"Generated: {state_slug}.svg ({len(metros)} metros)")
        generated_count += 1
    
    metros_json_path = os.path.join(OUTPUT_DIR, "metros_data.json")
    with open(metros_json_path, 'w') as f:
        json.dump(STATE_METROS, f, indent=2)
    
    print(f"\nGenerated {generated_count} state SVGs")
    print(f"Metros data saved to {metros_json_path}")


if __name__ == "__main__":
    main()
