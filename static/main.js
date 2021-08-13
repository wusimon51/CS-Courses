fetch('/data')
    .then(function (response) {
        response.json().then((courseMap) => {
            const nodes = courseMap.nodes;

            const links = courseMap.links;
            const width = d3.select('svg').attr('width');
            const height = d3.select('svg').attr('height');

            const simulation = d3.forceSimulation(nodes)
                .force("charge", d3.forceManyBody())
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("center", d3.forceCenter(width / 2, height / 2));

            const svg = d3.select('svg')
                .call(d3.zoom().on('zoom', (e) => {
                    svg
                        .selectAll('circle')
                        .attr('transform', e.transform);
                    svg
                        .selectAll('line')
                        .attr('transform', e.transform)

                }));

            const circles = svg
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('r', 8);

            const lines = svg
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('stroke', 'black');

            simulation.on('tick', () => {
                circles
                    .attr('cx', (node) => node.x)
                    .attr('cy', (node) => node.y);
                lines
                    .attr('x1', (link) => link.source.x)
                    .attr('y1', (link) => link.source.y)
                    .attr('x2', (link) => link.target.x)
                    .attr('y2', (link) => link.target.y)
            })

            // TODO add dragging
        })
    });

