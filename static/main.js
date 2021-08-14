fetch('/data')
    .then(function (response) {
        response.json().then((courseMap) => {

            const nodes = courseMap.nodes;
            const links = courseMap.links;
            const width = d3.select('svg').attr('width');
            const height = d3.select('svg').attr('height');
            const simulation = d3.forceSimulation(nodes)
                .force('charge', d3.forceManyBody())
                .force('link', d3.forceLink(links).id(d => d.id).strength(0.01))
                .force('center', d3.forceCenter(width / 2, height / 2));

            const svg = d3.select('svg')
                .call(d3.zoom().on('zoom', (e) => {
                    svg
                        .selectAll('circle')
                        .attr('transform', e.transform);
                    svg
                        .selectAll('line')
                        .attr('transform', e.transform)
                    svg
                        .selectAll('text')
                        .attr('transform', e.transform)
                }))

            const lines = svg
                .append('g')
                .attr('class', 'link')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('stroke', '#A9A9A9');

            const circles = svg
                .append('g')
                .attr('class', 'node')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('r', 8)

            const text = svg
                .append('g')
                .attr('class', 'text')
                .selectAll('text')
                .data(nodes)
                .enter()
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .style('pointer-events', 'none')
                .style('fill', 'blue')
                .text((node) => node.id);

            simulation.on('tick', () => {
                circles
                    .attr('cx', (node) => node.x)
                    .attr('cy', (node) => node.y);
                lines
                    .attr('x1', (link) => link.source.x)
                    .attr('y1', (link) => link.source.y)
                    .attr('x2', (link) => link.target.x)
                    .attr('y2', (link) => link.target.y)
                text
                    .attr('x', (node) => node.x)
                    .attr('y', (node) => node.y)
            })
        })
    });

