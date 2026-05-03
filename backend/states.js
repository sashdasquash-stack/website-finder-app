const STATES = {
  'al': { name: 'Alabama', cities: ['Birmingham, AL', 'Montgomery, AL', 'Huntsville, AL', 'Mobile, AL', 'Tuscaloosa, AL'] },
  'ak': { name: 'Alaska', cities: ['Anchorage, AK', 'Fairbanks, AK', 'Juneau, AK', 'Wasilla, AK', 'Sitka, AK'] },
  'az': { name: 'Arizona', cities: ['Phoenix, AZ', 'Tucson, AZ', 'Mesa, AZ', 'Chandler, AZ', 'Scottsdale, AZ'] },
  'ar': { name: 'Arkansas', cities: ['Little Rock, AR', 'Fayetteville, AR', 'Fort Smith, AR', 'Springdale, AR', 'Jonesboro, AR'] },
  'ca': { name: 'California', cities: ['Los Angeles, CA', 'San Diego, CA', 'San Jose, CA', 'San Francisco, CA', 'Sacramento, CA'] },
  'co': { name: 'Colorado', cities: ['Denver, CO', 'Colorado Springs, CO', 'Aurora, CO', 'Fort Collins, CO', 'Boulder, CO'] },
  'ct': { name: 'Connecticut', cities: ['Bridgeport, CT', 'New Haven, CT', 'Stamford, CT', 'Hartford, CT', 'Waterbury, CT'] },
  'de': { name: 'Delaware', cities: ['Wilmington, DE', 'Dover, DE', 'Newark, DE', 'Middletown, DE', 'Smyrna, DE'] },
  'fl': { name: 'Florida', cities: ['Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Jacksonville, FL', 'Tallahassee, FL'] },
  'ga': { name: 'Georgia', cities: ['Atlanta, GA', 'Augusta, GA', 'Columbus, GA', 'Macon, GA', 'Savannah, GA'] },
  'hi': { name: 'Hawaii', cities: ['Honolulu, HI', 'Pearl City, HI', 'Hilo, HI', 'Kailua, HI', 'Waipahu, HI'] },
  'id': { name: 'Idaho', cities: ['Boise, ID', 'Meridian, ID', 'Nampa, ID', 'Idaho Falls, ID', 'Pocatello, ID'] },
  'il': { name: 'Illinois', cities: ['Chicago, IL', 'Aurora, IL', 'Naperville, IL', 'Rockford, IL', 'Joliet, IL'] },
  'in': { name: 'Indiana', cities: ['Indianapolis, IN', 'Fort Wayne, IN', 'Evansville, IN', 'South Bend, IN', 'Carmel, IN'] },
  'ia': { name: 'Iowa', cities: ['Des Moines, IA', 'Cedar Rapids, IA', 'Davenport, IA', 'Sioux City, IA', 'Iowa City, IA'] },
  'ks': { name: 'Kansas', cities: ['Wichita, KS', 'Overland Park, KS', 'Kansas City, KS', 'Olathe, KS', 'Topeka, KS'] },
  'ky': { name: 'Kentucky', cities: ['Louisville, KY', 'Lexington, KY', 'Bowling Green, KY', 'Owensboro, KY', 'Covington, KY'] },
  'la': { name: 'Louisiana', cities: ['New Orleans, LA', 'Baton Rouge, LA', 'Shreveport, LA', 'Lafayette, LA', 'Lake Charles, LA'] },
  'me': { name: 'Maine', cities: ['Portland, ME', 'Lewiston, ME', 'Bangor, ME', 'South Portland, ME', 'Auburn, ME'] },
  'md': { name: 'Maryland', cities: ['Baltimore, MD', 'Frederick, MD', 'Rockville, MD', 'Gaithersburg, MD', 'Bowie, MD'] },
  'ma': { name: 'Massachusetts', cities: ['Boston, MA', 'Worcester, MA', 'Springfield, MA', 'Cambridge, MA', 'Lowell, MA'] },
  'mi': { name: 'Michigan', cities: ['Detroit, MI', 'Grand Rapids, MI', 'Warren, MI', 'Sterling Heights, MI', 'Lansing, MI'] },
  'mn': { name: 'Minnesota', cities: ['Minneapolis, MN', 'Saint Paul, MN', 'Rochester, MN', 'Duluth, MN', 'Bloomington, MN'] },
  'ms': { name: 'Mississippi', cities: ['Jackson, MS', 'Gulfport, MS', 'Southaven, MS', 'Hattiesburg, MS', 'Biloxi, MS'] },
  'mo': { name: 'Missouri', cities: ['Kansas City, MO', 'Saint Louis, MO', 'Springfield, MO', 'Columbia, MO', 'Independence, MO'] },
  'mt': { name: 'Montana', cities: ['Billings, MT', 'Missoula, MT', 'Great Falls, MT', 'Bozeman, MT', 'Butte, MT'] },
  'ne': { name: 'Nebraska', cities: ['Omaha, NE', 'Lincoln, NE', 'Bellevue, NE', 'Grand Island, NE', 'Kearney, NE'] },
  'nv': { name: 'Nevada', cities: ['Las Vegas, NV', 'Henderson, NV', 'Reno, NV', 'North Las Vegas, NV', 'Sparks, NV'] },
  'nh': { name: 'New Hampshire', cities: ['Manchester, NH', 'Nashua, NH', 'Concord, NH', 'Derry, NH', 'Dover, NH'] },
  'nj': { name: 'New Jersey', cities: ['Newark, NJ', 'Jersey City, NJ', 'Paterson, NJ', 'Elizabeth, NJ', 'Edison, NJ'] },
  'nm': { name: 'New Mexico', cities: ['Albuquerque, NM', 'Las Cruces, NM', 'Rio Rancho, NM', 'Santa Fe, NM', 'Roswell, NM'] },
  'ny': { name: 'New York', cities: ['New York, NY', 'Buffalo, NY', 'Rochester, NY', 'Yonkers, NY', 'Syracuse, NY'] },
  'nc': { name: 'North Carolina', cities: ['Charlotte, NC', 'Raleigh, NC', 'Greensboro, NC', 'Durham, NC', 'Winston-Salem, NC'] },
  'nd': { name: 'North Dakota', cities: ['Fargo, ND', 'Bismarck, ND', 'Grand Forks, ND', 'Minot, ND', 'West Fargo, ND'] },
  'oh': { name: 'Ohio', cities: ['Columbus, OH', 'Cleveland, OH', 'Cincinnati, OH', 'Toledo, OH', 'Akron, OH'] },
  'ok': { name: 'Oklahoma', cities: ['Oklahoma City, OK', 'Tulsa, OK', 'Norman, OK', 'Broken Arrow, OK', 'Edmond, OK'] },
  'or': { name: 'Oregon', cities: ['Portland, OR', 'Salem, OR', 'Eugene, OR', 'Gresham, OR', 'Hillsboro, OR'] },
  'pa': { name: 'Pennsylvania', cities: ['Philadelphia, PA', 'Pittsburgh, PA', 'Allentown, PA', 'Erie, PA', 'Reading, PA'] },
  'ri': { name: 'Rhode Island', cities: ['Providence, RI', 'Warwick, RI', 'Cranston, RI', 'Pawtucket, RI', 'East Providence, RI'] },
  'sc': { name: 'South Carolina', cities: ['Charleston, SC', 'Columbia, SC', 'North Charleston, SC', 'Mount Pleasant, SC', 'Greenville, SC'] },
  'sd': { name: 'South Dakota', cities: ['Sioux Falls, SD', 'Rapid City, SD', 'Aberdeen, SD', 'Brookings, SD', 'Watertown, SD'] },
  'tn': { name: 'Tennessee', cities: ['Memphis, TN', 'Nashville, TN', 'Knoxville, TN', 'Chattanooga, TN', 'Clarksville, TN'] },
  'tx': { name: 'Texas', cities: ['Houston, TX', 'San Antonio, TX', 'Dallas, TX', 'Austin, TX', 'Fort Worth, TX'] },
  'ut': { name: 'Utah', cities: ['Salt Lake City, UT', 'West Valley City, UT', 'Provo, UT', 'West Jordan, UT', 'Orem, UT'] },
  'vt': { name: 'Vermont', cities: ['Burlington, VT', 'South Burlington, VT', 'Rutland, VT', 'Essex Junction, VT', 'Colchester, VT'] },
  'va': { name: 'Virginia', cities: ['Virginia Beach, VA', 'Norfolk, VA', 'Chesapeake, VA', 'Richmond, VA', 'Newport News, VA'] },
  'wa': { name: 'Washington', cities: ['Seattle, WA', 'Spokane, WA', 'Tacoma, WA', 'Vancouver, WA', 'Bellevue, WA'] },
  'wv': { name: 'West Virginia', cities: ['Charleston, WV', 'Huntington, WV', 'Morgantown, WV', 'Parkersburg, WV', 'Wheeling, WV'] },
  'wi': { name: 'Wisconsin', cities: ['Milwaukee, WI', 'Madison, WI', 'Green Bay, WI', 'Kenosha, WI', 'Racine, WI'] },
  'wy': { name: 'Wyoming', cities: ['Cheyenne, WY', 'Casper, WY', 'Laramie, WY', 'Gillette, WY', 'Rock Springs, WY'] },
  'dc': { name: 'Washington DC', cities: ['Washington, DC'] },
};

const NAME_TO_ABBR = Object.fromEntries(
  Object.entries(STATES).map(([abbr, { name }]) => [name.toLowerCase(), abbr])
);

function detectState(query) {
  const cleaned = (query || '')
    .trim()
    .toLowerCase()
    .replace(/,?\s*(usa|us|united states|u\.s\.|u\.s\.a\.)\.?$/i, '')
    .replace(/\s+state$/i, '')
    .trim();

  if (cleaned.length === 2 && STATES[cleaned]) {
    return { abbr: cleaned, ...STATES[cleaned] };
  }
  if (NAME_TO_ABBR[cleaned]) {
    const abbr = NAME_TO_ABBR[cleaned];
    return { abbr, ...STATES[abbr] };
  }
  return null;
}

module.exports = { STATES, detectState };
