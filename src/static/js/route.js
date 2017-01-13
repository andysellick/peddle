
//FIXME check distances again for any country that defaults to m not km e.g. australia, india?

//dist is distance from previous location to this one
//type of 1 is a journey by alternate means, 1 = boat, 2 = flight
//loc is country this place is in, will output current country location as that of target
//therefore need to ensure route passes through somewhere either side of every border
var dests = [
{	'name':'London',
	'dist':0,
	'll':[51.507489,-0.127684],
	'loc':'England'
},
{	'name':'Maidstone',
	'dist':66,
	'll':[51.271847,0.521282],
	'loc':'England'
},
{	'name':'Dover',
	'dist':75,
	'll':[51.123871,1.332285],
	'loc':'England'
},
{	'name':'Calais',
	'dist':40,
	'll':[50.966679,1.849909],
	'loc':'France',
	'type':1,
	'time':1800 //time to complete journey in seconds, in this case 30 minutes on the ferry
},
{	'name':'Ghyvelde',
	'll':[51.051858,2.526616],
	'dist':55,
	'loc':'France'
},
{	'name':'Veurne',
	'll':[51.073159,2.668034],
	'dist':15,
	'loc':'Belgium'
},
{	'name':'Ghent',
	'll':[51.054342,3.717424],
	'dist':86,
	'loc':'Belgium'
},
{	'name':'Brussels',
	'dist':56,
	'll':[50.85034,4.35171],
	'loc':'Belgium'
},
{	'name':'Kotem',
	'dist':110,
	'll':[50.948568,5.746705],
	'loc':'Belgium'
},
{	'name':'Stein',
	'dist':4,
	'll':[50.967974,5.76622],
	'loc':'Netherlands'
},
{	'name':'Bocholtz',
	'dist':32,
	'll':[50.818041,6.008855],
	'loc':'Netherlands'
},
{	'name':'Vetschau',
	'dist':3,
	'll':[50.816706,6.041536],
	'loc':'Germany'
},
{	'name':'Kerpen',
	'dist':54,
	'll':[50.874759,6.688373],
	'loc':'Germany'
},
{	'name':'Bonn',
	'dist':51,
	'll':[50.73743,7.098207],
	'loc':'Germany'
},
{	'name':'Limburg',
	'dist':102,
	'll':[50.398601,8.079578],
	'loc':'Germany'
},
{	'name':'Frankfurt',
	'dist':77,
	'll':[50.110922,8.682127],
	'loc':'Germany'
},
{	'name':'Wurzburg',
	'pnam':'W&uuml;rzburg',
	'dist':119,
	'll':[49.791304,9.953355],
	'loc':'Germany'
},
{	'name':'Nuremburg',
	'dist':109,
	'll':[49.425409,11.079655],
	'loc':'Germany'
},
{	'name':'Regensburg',
	'dist':113,
	'll':[49.01343,12.101624],
	'loc':'Germany'
},
{	'name':'Ruhstorf an der Rott',
	'dist':137,
	'll':[48.43888,13.333152],
	'loc':'Germany'
},
{	'name':'Dietrichshofen',
	'dist':16,
	'll':[48.37291,13.42101],
	'loc':'Austria'
},
{	'name':'Marchtrenk',
	'dist':73,
	'll':[48.190705,14.120247],
	'loc':'Austria'
},
{	'name':'Vienna',
	'dist':192,
	'll':[48.208174,16.373819],
	'loc':'Austria'
},
{	'name':'Neue Teilung',
	'dist':76,
	'll':[47.9267,17.1037],
	'loc':'Austria'
},
{	'name':'Hegyeshalom',
	'dist':5,
	'll':[47.911745,17.156071],
	'loc':'Hungary'
},
{	'name':'Gyor',
	'pnam':'Gy&otilde;r',
	'dist':51,
	'll':[47.687457,17.650397],
	'loc':'Hungary'
},
{	'name':'Budapest',
	'dist':121,
	'll':[47.497912,19.040235],
	'loc':'Hungary'
},
{	'name':'Roszke',
	'pnam':'R&ouml;szke',
	'dist':178,
	'll':[46.187377,20.037455],
	'loc':'Hungary'
},
{	'name':'Horgos',
	'pnam':'Horgo&#353;',
	'dist':12,
	'll':[46.143103,19.95367],
	'loc':'Serbia'
},
{	'name':'Belgrade',
	'dist':200,
	'll':[44.786568,20.448922],
	'loc':'Serbia'
},
{	'name':'Dimitrovgrad',
	'dist':332,
	'll':[43.020812,22.782693],
	'loc':'Serbia'
},
{	'name':'Novo Bardo',
	'dist':12,
	'll':[42.967736,22.845839],
	'loc':'Bulgaria'
},
{	'name':'Sofia',
	'dist':58,
	'll':[42.697708,23.321868],
	'loc':'Bulgaria'
},
{	'name':'Kapitan Andreevo',
	'dist':291,
	'll':[41.72073,26.317757],
	'loc':'Bulgaria'
},
{	'name':'Edirne',
	'dist':21,
	'll':[41.676925,26.552753],
	'loc':'Turkey'
},
{	'name':'Istanbul',
	'dist':239,
	'll':[41.008238,28.978359],
	'loc':'Turkey'
},
{	'name':'Merzifon',
	'dist':632,
	'll':[40.87477,35.461753],
	'loc':'Turkey'
},
{	'name':'Erzurum',
	'dist':603,
	'll':[39.905499,41.265824],
	'loc':'Turkey'
},
{	'name':'Gurbulak Koyu',
	'pnam':'G&uuml;rbulak K&ouml;y&uuml;',
	'dist':310,
	'll':[39.415092,44.353904],
	'loc':'Turkey'
},
{	'name':'Bazargan',
	'dist':6,
	'll':[39.390212,44.390143],
	'loc':'Iran'
},
{	'name':'Tabriz',
	'dist':286,
	'll':[38.096239,46.273801],
	'loc':'Iran'
},
{	'name':'Qom',
	'dist':701,
	'll':[34.639944,50.875942],
	'loc':'Iran'
},
{	'name':'Istgah landi',
	'dist':1425,
	'll':[29.082636,61.414366],
	'loc':'Iran'
},
{	'name':'Taftan',
	'dist':20,
	'll':[28.974376,61.557404],
	'loc':'Pakistan'
},
{	'name':'Quetta',
	'dist':632,
	'll':[30.182971,66.998734],
	'loc':'Pakistan'
},
{	'name':'Lahore',
	'dist':979,
	'll':[31.554606,74.357158],
	'loc':'Pakistan'
},
{	'name':'Wahga',
	'dist':23,
	'll':[31.604757,74.574136],
	'loc':'Pakistan'
},
{	'name':'Atari', //tricky border crossing
	'dist':5,
	'll':[31.597811,74.601978],
	'loc':'India'
},
{	'name':'New Delhi',
	'dist':500,
	'll':[28.613939,77.209021],
	'loc':'India'
},
{	'name':'Lucknow',
	'dist':557,
	'll':[26.846694,80.946166],
	'loc':'India'
},
{	'name':'Muzaffarpur',
	'dist':530,
	'll':[26.120888,85.36472],
	'loc':'India'
},
{	'name':'Guwahati',
	'dist':815,
	'll':[26.144517,91.736237],
	'loc':'India'
},
{	'name':'Moreh',
	'dist':597,
	'll':[24.251281,94.301304],
	'loc':'India'
},
{	'name':'Tamu',
	'dist':5,
	'll':[24.219884,94.310288],
	'loc':'Burma'
},
{	'name':'Mandalay',
	'dist':476,
	'll':[21.181818,95.898714],
	'loc':'Burma'
},
{	'name':'Naypyitaw',
	'dist':269,
	'll':[19.75305,96.125082],
	'loc':'Burma'
},
{	'name':'Bago',
	'dist':305,
	'll':[18.33128,96.067919],
	'loc':'Burma'
},
{	'name':'Kawkareik',
	'dist':294,
	'll':[16.557378,98.24044],
	'loc':'Burma'
},
{	'name':'Tak',
	'dist':156,
	'll':[16.88399,99.12585],
	'loc':'Thailand'
},
{	'name':'Bangkok',
	'dist':419,
	'll':[13.756331,100.501765],
	'loc':'Thailand'
},
{	'name':'Ratchaburi',
	'dist':100,
	'll':[13.528289,99.813421],
	'loc':'Thailand'
},
{	'name':'Prachuap Khiri Khan',
	'dist':214,
	'll':[11.812367,99.797327],
	'loc':'Thailand'
},
{	'name':'Chumphon',
	'dist':189,
	'll':[10.49305,99.18002],
	'loc':'Thailand'
},
{	'name':'Phattalung',
	'dist':386,
	'll':[7.616682,100.074023],
	'loc':'Thailand'
},
{	'name':'Bukit Kayu Hitam',
	'dist':152,
	'll':[6.509743,100.420391],
	'loc':'Malaysia'
},
{	'name':'Kedah',
	'dist':48,
	'll':[6.118396,100.368459],
	'loc':'Malaysia'
},
{	'name':'Bukit Mertajam',
	'dist':103,
	'll':[5.365458,100.459009],
	'loc':'Malaysia'
},
{	'name':'Kuala Lumpur',
	'dist':338,
	'll':[3.139003,101.686855],
	'loc':'Malaysia'
},
{	'name':'Johor',
	'dist':333,
	'll':[1.485368,103.761815],
	'loc':'Malaysia'
},
{	'name':'Singapore',
	'dist':27,
	'll':[1.355379,103.867744],
	'loc':'Singapore'
},
{	'name':'Jakarta',
	'dist':1269,
	'll':[-6.174465,106.822745],
	'loc':'Indonesia',
	'type':1,
	'time':226800 //63 hours
},
{	'name':'Surabaya',
	'dist':774,
	'll':[-7.257472,112.752088],
	'loc':'Indonesia',
},
{	'name':'Jalan Banyuwangi',
	'dist':293,
	'll':[-8.170297,114.386544],
	'loc':'Indonesia',
},
{	'name':'Gilimanuk',
	'dist':5,
	'll':[-8.210583,114.45892],
	'loc':'Indonesia',
	'type':1,
	'time':1800 //30 minutes, assuming 10kmph boat speed
},
{	'name':'Denpasar City',
	'dist':123,
	'll':[-8.670458,115.212629],
	'loc':'Indonesia',
},
{	'name':'Padangbai Harbour',
	'dist':44,
	'll':[-8.533883,115.508879],
	'loc':'Indonesia',
},
{	'name':'Pelabuhan Lembar',
	'dist':71,
	'll':[-8.729116,116.077389],
	'loc':'Indonesia',
	'type':1,
	'time':25200 //7 hours, assuming 10kmph boat speed
},
{	'name':'Lombok',
	'dist':93,
	'll':[-8.513243,116.666397],
	'loc':'Indonesia',
},
{	'name':'Jalan Raya Dermaga',
	'dist':24,
	'll':[-8.521662,116.832035],
	'loc':'Indonesia',
	'type':1,
	'time':8280 //2.3 hours, assuming 10kmph boat speed
},
{	'name':'Bima',
	'dist':341,
	'll':[-8.447973,118.713992],
	'loc':'Indonesia',
},
{	'name':'Bandara Komodo',
	'dist':125,
	'll':[-8.488628,119.887571],
	'loc':'Indonesia',
	'type':1,
	'time':30600 //8.5 hours
},
{	'name':'Pelabuhan Larantuka',
	'dist':648,
	'll':[-8.343337,122.988929],
	'loc':'Indonesia',
},
{	'name':'Kupang',
	'dist':237,
	'll':[-10.195952,123.527098],
	'loc':'Indonesia',
	'type':1,
	'time':48600
},
{	'name':'Jalan Betun-Perbatasan',
	'dist':255,
	'll':[-9.456272,125.076477],
	'loc':'Indonesia',
},
{	'name':'Jalan Lintas Batas Malaka',
	'dist':2,
	'll':[-9.449589,125.091305],
	'loc':'Timor-Leste',
},
{	'name':'Tutuala',
	'dist':365,
	'll':[-8.393534,127.255075],
	'loc':'Timor-Leste',
},
{	'name':'Darwin',
	'dist':600,
	'll':[-12.46344,130.845642],
	'loc':'Australia',
	'type':1,
	'time':216000 //60 hours
},
{	'name':'Elliott',
	'dist':735,
	'll':[-17.553611,133.544722],
	'loc':'Australia',
},
{	'name':'Alice Springs',
	'dist':762,
	'll':[-23.698042,133.880747],
	'loc':'Australia',
},
{	'name':'Adelaide',
	'dist':1535,
	'll':[-34.928499,138.600746],
	'loc':'Australia',
},
{	'name':'Melbourne',
	'dist':727,
	'll':[-37.813611,144.963056],
	'loc':'Australia',
},
{	'name':'Invercargill',
	'dist':2140,
	'll':[-46.413187,168.353773],
	'loc':'New Zealand',
	'type':2,
	'time':24300 //6 hours 45 minutes
},
{	'name':'Dunedin',
	'dist':205,
	'll':[-45.878761,170.502798],
	'loc':'New Zealand',
},
{	'name':'Timaru',
	'dist':197,
	'll':[-44.396972,171.254973],
	'loc':'New Zealand',
},
{	'name':'Christchurch',
	'dist':165,
	'll':[-43.532054,172.636225],
	'loc':'New Zealand',
},
{	'name':'Kaikoura',
	'dist':181,
	'll':[-42.400817,173.681386],
	'loc':'New Zealand',
},
{	'name':'Picton',
	'dist':156,
	'll':[-41.290593,174.001004],
	'loc':'New Zealand',
},
{	'name':'Wellington',
	'dist':65,
	'll':[-41.28646,174.776236],
	'loc':'New Zealand',
	'type':1,
	'time':10800 //3 hours
},
{	'name':'Turangi',
	'dist':321,
	'll':[-38.989871,175.808748],
	'loc':'New Zealand',
},
{	'name':'Auckland',
	'dist':323,
	'll':[-36.84846,174.763332],
	'loc':'New Zealand',
},
{	'name':'Ushuaia',
	'dist':8163,
	'll':[-54.801912,-68.302951],
	'loc':'Argentina',
	'type':2,
	'time':104400 //29 hours
},
{	'name':'San Sebastian',
	'dist':284,
	'll':[-53.298999,-68.45727],
	'loc':'Argentina',
},
{	'name':'Puerto Progreso',
	'dist':169,
	'll':[-52.49478,-69.523544],
	'loc':'Chile',
},
{	'name':'Punta Espora',
	'dist':153,
	'll':[-52.455528,-69.548435],
	'loc':'Chile',
},
{	'name':'Punta Delgada',
	'dist':5,
	'll':[-52.315556,-69.688056],
	'loc':'Chile',
	'type':1,
	'time':1800
},
{	'name':'Rio Gallegos',
	'dist':97,
	'll':[-51.631412,-69.226055],
	'loc':'Chile',
},
{	'name':'Rio Chico',
	'dist':268,
	'll':[-49.776018,-68.637407],
	'loc':'Argentina',
},
{	'name':'Caleta Olivia',
	'dist':433,
	'll':[-46.442045,-67.517681],
	'loc':'Argentina',
},
{	'name':'Las Grutas',
	'dist':764,
	'll':[-40.749182,-65.120773],
	'loc':'Argentina',
},
{	'name':'Santa Rosa',
	'dist':523,
	'll':[-36.620922,-64.291237],
	'loc':'Argentina',
},
{	'name':'Cordoba',
	'dist':609,
	'll':[-31.420083,-64.188776],
	'loc':'Argentina',
},
{	'name':'Jujuy',
	'dist':898,
	'll':[-24.185786,-65.299477],
	'loc':'Argentina',
},
{	'name':'San Pedro de Atacama',
	'dist':476,
	'll':[-22.908707,-68.199716],
	'loc':'Chile',
},
{	'name':'Calama',
	'dist':254,
	'll':[-22.454392,-68.929382],
	'loc':'Chile',
},
{	'name':'Arica',
	'dist':621,
	'll':[-18.478253,-70.312599],
	'loc':'Chile',
},
{	'name':'Tacna',
	'dist':58,
	'll':[-18.006568,-70.246274],
	'loc':'Peru',
},
{	'name':'Ilo District',
	'dist':156,
	'll':[-17.668084,-71.346809],
	'loc':'Peru',
},
{	'name':'Camana',
	'dist':251,
	'll':[-16.622245,-72.711071],
	'loc':'Peru',
},
{	'name':'Nazca',
	'dist':393,
	'll':[-14.835869,-74.932758],
	'loc':'Peru',
},
{	'name':'Lima District',
	'dist':454,
	'll':[-12.046374,-77.042793],
	'loc':'Peru',
},
{	'name':'La Gramita',
	'dist':338,
	'll':[-9.717948,-78.293526],
	'loc':'Peru',
},
{	'name':'Trujillo',
	'dist':293,
	'll':[-8.109052,-79.021534],
	'loc':'Peru',
},
{	'name':'Chiclayo',
	'dist':204,
	'll':[-6.776597,-79.844298],
	'loc':'Peru',
},
{	'name':'La Tina',
	'dist':344,
	'll':[-4.39305,-79.96788],
	'loc':'Peru',
},
{	'name':'Macara',
	'dist':5,
	'll':[-4.375827,-79.936059],
	'loc':'Ecuador',
},
{	'name':'Loja',
	'dist':177,
	'll':[-4.007891,-79.211277],
	'loc':'Ecuador',
},
{	'name':'San Juan Bosco',
	'dist':215,
	'll':[-3.103169,-78.520432],
	'loc':'Ecuador',
},
{	'name':'Puyo',
	'dist':249,
	'll':[-1.492392,-78.002413],
	'loc':'Ecuador',
},
{	'name':'Nueva Loja',
	'dist':324,
	'll':[0.085103,-76.894016],
	'loc':'Ecuador',
},
{	'name':'Popayan',
	'dist':478,
	'll':[2.444814,-76.614739],
	'loc':'Colombia',
},
{	'name':'Neiva',
	'dist':270,
	'll':[2.937619,-75.272388],
	'loc':'Colombia',
},
{	'name':'Bogota',
	'dist':309,
	'll':[4.710989,-74.072092],
	'loc':'Colombia',
},
{	'name':'Medellin',
	'dist':419,
	'll':[6.253041,-75.564574],
	'loc':'Colombia',
},
{	'name':'Panama City',
	'dist':548,
	'll':[8.982379,-79.51987],
	'loc':'Panama',
	'type':2,
	'time':4500
},
{	'name':'David',
	'dist':467,
	'll':[8.400728,-82.442777],
	'loc':'Panama',
},
{	'name':'Aserrio',
	'dist':53,
	'll':[8.527304,-82.799419],
	'loc':'Panama',
},
{	'name':'Paso Canoas',
	'dist':11,
	'll':[8.536332,-82.845215],
	'loc':'Costa Rica',
},
{	'name':'San Jose',
	'dist':319,
	'll':[9.928069,-84.090725],
	'loc':'Costa Rica',
},
{	'name':'La Fortuna',
	'dist':130,
	'll':[10.467834,-84.642681],
	'loc':'Costa Rica',
},
{	'name':'Penas Blancas',
	'dist':188,
	'll':[11.211153,-85.612733],
	'loc':'Costa Rica',
},
{	'name':'Sapoa',
	'dist':5,
	'll':[11.247304,-85.626785],
	'loc':'Nicaragua',
},
{	'name':'Managua',
	'dist':132,
	'll':[12.13917,-86.337676],
	'loc':'Nicaragua',
},
{	'name':'Dipilto',
	'dist':238,
	'll':[13.720299,-86.508498],
	'loc':'Nicaragua',
},
{	'name':'El Paraiso',
	'dist':25,
	'll':[13.863464,-86.552782],
	'loc':'Honduras',
},
{	'name':'San Pedro Sula',
	'dist':367,
	'll':[15.51492,-87.992268],
	'loc':'Honduras',
},
{	'name':'Corinto',
	'dist':113,
	'll':[15.585405,-88.370066],
	'loc':'Honduras',
},
{	'name':'Hopi',
	'dist':10,
	'll':[15.636559,-88.412046],
	'loc':'Guatemala',
},
{	'name':'Chocon',
	'dist':125,
	'll':[15.871673,-89.220569],
	'loc':'Guatemala',
},
{	'name':'El Ceibo',
	'dist':320,
	'll':[17.25908,-90.982664],
	'loc':'Guatemala',
},
{	'name':'El Ceibo',
	'dist':2,
	'll':[17.266667,-91],
	'loc':'Mexico',
},
{	'name':'Heroica Veracruz',
	'dist':736,
	'll':[19.173773,-96.134224],
	'loc':'Mexico',
},
{	'name':'Tamaulipas',
	'dist':788,
	'll':[24.26694,-98.836275],
	'loc':'Mexico',
},
{	'name':'Reynosa',
	'dist':283,
	'll':[26.050841,-98.297895],
	'loc':'Mexico',
},
{	'name':'Hidalgo',
	'dist':12,
	'll':[26.100355,-98.263068],
	'loc':'USA',
},
{	'name':'Houston',
	'dist':572,
	'll':[29.760427,-95.369803],
	'loc':'USA',
},
{	'name':'Baton Rouge',
	'dist':438,
	'll':[30.458283,-91.14032],
	'loc':'USA',
},
{	'name':'Knoxville',
	'dist':463,
	'll':[35.960638,-83.920739],
	'loc':'USA',
},
{	'name':'Roanoke',
	'dist':417,
	'll':[37.27097,-79.941427],
	'loc':'USA',
},
{	'name':'Washington',
	'dist':387,
	'll':[38.907192,-77.036871],
	'loc':'USA',
},
{	'name':'New York',
	'dist':362,
	'll':[40.712784,-74.005941],
	'loc':'USA',
},
{	'name':'Lisbon',
	'dist':5432,
	'll':[38.722252,-9.139337],
	'loc':'Portugal',
	'type':2,
	'time':25200
},
{	'name':'Vilar Formoso',
	'dist':350,
	'll':[40.614846,-6.837112],
	'loc':'Portugal',
},
{	'name':'Fuentes de Onoro',
	'dist':4,
	'll':[40.567693,-6.781524],
	'loc':'Spain',
},
{	'name':'Burgos',
	'dist':356,
	'll':[42.338076,-3.581269],
	'loc':'Spain',
},
{	'name':'Behobia',
	'dist':237,
	'll':[43.343125,-1.762103],
	'loc':'Spain',
},
{	'name':'Hendaye',
	'dist':6,
	'll':[43.359399,-1.766148],
	'loc':'France',
},
{	'name':'Bordeaux',
	'dist':218,
	'll':[44.837789,-0.57918],
	'loc':'France',
},
{	'name':'Poitiers',
	'dist':258,
	'll':[46.580224,0.340375],
	'loc':'France',
},
{	'name':'Rouen',
	'dist':419,
	'll':[49.443232,1.099971],
	'loc':'France',
},
{	'name':'Calais',
	'dist':215,
	'll':[50.966679,1.849909],
	'loc':'France',
},
{	'name':'Dover',
	'dist':40,
	'll':[51.123871,1.332285],
	'loc':'England',
	'type':1,
	'time':1800 //time to complete journey in seconds, in this case 30 minutes on the ferry
},
{	'name':'Maidstone',
	'dist':73,
	'll':[51.271847,0.521282],
	'loc':'England'
},
{	'name':'London',
	'll':[51.507489,-0.127684],
	'dist':61,
	'loc':'England',
}
];