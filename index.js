const kMeans2 = (data, clusters, iterations) => {
    // Initialize the clusters
    let clusterCenters = data.slice(0, clusters).map((d, i) => {
        return {
        id: i,
        x: d.x,
        y: d.y,
        points: []
        };
    });
    
    // Iterate the algorithm
    for (let i = 0; i < iterations; i++) {
        // Assign points to clusters
        data.forEach(d => {
        let minDist = Infinity;
        let cluster = null;
        clusterCenters.forEach(c => {
            let dist = Math.sqrt(Math.pow(d.x - c.x, 2) + Math.pow(d.y - c.y, 2));
            if (dist < minDist) {
            minDist = dist;
            cluster = c;
            }
        });
        cluster.points.push(d);
        });
    
        // Update cluster centers
        clusterCenters.forEach(c => {
        let x = 0;
        let y = 0;
        c.points.forEach(p => {
            x += p.x;
            y += p.y;
        });
        c.x = x / c.points.length;
        c.y = y / c.points.length;
        c.points = [];
        });
    }
    
    return clusterCenters;
}
// yield

const data = [[ 9.89697121, -4.68650189],
[-3.90768378, -3.77930299],
[-3.61259501, -2.69125814],
[ 8.31446323, -3.55511125],
[-1.64377733, -0.50171873],
[-4.03465219, -3.76606988],
[-3.27411785, -3.51725386],
[11.11624068, -3.38123254],
[-1.79832678, -2.9085285 ],
[ 8.91371199, -2.18761869],
[ 8.47601931, -4.85643467],
[ 6.69617129, -4.08421628],
[-2.56586432,  0.4955803 ],
[-3.70665762, -1.9895472 ],
[-3.76446262, -4.72219523],
[-4.74286752, -4.14260488],
[-4.21014552, -1.99817727],
[-1.89249637, -2.84199262],
[-4.53474376, -4.61680614],
[-3.61099769, -3.2221109 ]]

const iterationSteps = [];

const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

const kMeans = (points, clusters, iterations) => {
    const minX = Math.min(...points.map(d => d[0]));
    const maxX = Math.max(...points.map(d => d[0]));
    const minY = Math.min(...points.map(d => d[1]));
    const maxY = Math.max(...points.map(d => d[1]));

    const randomPointX = () => Math.random() * (maxX - minX) + minX;
    const randomPointY = () => Math.random() * (maxY - minY) + minY;

    const initialCentroids = Array.from({ length: clusters }, () => {
        return [randomPointX(), randomPointY()];
    });

    let centroids = initialCentroids;
    let clustersAssignedPoints = null;

    const pointsInClusters = (points) => 
        (clustersCenters) => {
            const assignedPoints = Array.from({ length: clusters }, () => []);

            points.forEach(point => {
                const distances = clustersCenters.map(cluster => dist(point[0], point[1], cluster[0], cluster[1]));
                const minDistance = Math.min(...distances);
                const clusterIndex = distances.indexOf(minDistance);

                assignedPoints[clusterIndex].push(point);
            });

            return assignedPoints;
    };

    const getPointsInClusters = pointsInClusters(points);

    const updateClusterCenteroids = (clusterPoints) => {
        if (!clusterPoints.length) {
            return [randomPointX(), randomPointY()];
        }

        const [sumX, sumY] = clusterPoints.reduce(([x, y], [sumX, sumY]) => [x + sumX, y + sumY], [0, 0]);

        return [
            sumX / clusterPoints.length,
            sumY / clusterPoints.length
        ]
    }

    clustersAssignedPoints = getPointsInClusters(centroids);
    // saving iteraton step
    iterationSteps.push(
        {
            centroids,
            clustersAssignedPoints,
        }
    )
    for (let i = 0; i < iterations; i++) {
        centroids = clustersAssignedPoints.map(updateClusterCenteroids);
        iterationSteps.push(
            {
                centroids,
                clustersAssignedPoints,
            }
        )
        clustersAssignedPoints = getPointsInClusters(centroids);
    }

    return {
        centroids,
        clustersAssignedPoints,
    };
}

const { 
    centroids, 
    clustersAssignedPoints,
} = kMeans(data, 3, 10)


const generateClustesTraces = (clusters) => {
    return clusters.map((cluster, i) => {
        return {
            x: cluster.map(d => d[0]),
            y: cluster.map(d => d[1]),
            mode: 'markers',
            type: 'scatter',
            name: `Cluster ${i}`,
        }
    });
}

const generateCentroidsTraces = (centroids) => {
    return centroids.map((cendroid, i) => {
        const [x, y] = cendroid;
        const pointsAssignedCluster = clustersAssignedPoints[i];

        const distances = pointsAssignedCluster.map(point => dist(point[0], point[1], x, y));
        const maxDistance = Math.max(...distances);
    
        return {
            x: [x],
            y: [y],
            mode: 'markers',
            type: 'scatter',
            name: `Centroid ${i}`,
            marker: { size: 20, color: 'black', opacity: 0.5 }
        }
    })
}


const layout = {
    title:'K-means clustering',
};  

const showPlot = () => {
    const { centroids, clustersAssignedPoints } = iterationSteps[iteration];

    const traces = [
        ...generateClustesTraces(clustersAssignedPoints),
        ...generateCentroidsTraces(centroids)
    ]

    Plotly.react('plotly', traces, layout);
}


let iteration = iterationSteps.length - 1;

const update = () => {
    if (iteration >= iterationSteps.length || iteration < 0) iteration = 0;

    iterEl.innerText = iteration;

    showPlot()
};

prevIterEl.onclick = () => {
    iteration--;
    update()
};

nextIterEl.onclick = () => {
    iteration++;
    update()
};  

update();
