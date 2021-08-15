fetch('/data')
    .then(function (response) {
        response.json().then((courseMap) => {
            const nodes = courseMap.nodes.map(node => Object.create(node));
            const links = courseMap.links.map(link => Object.create(link));
            const width = d3.select('svg').attr('width');
            const height = d3.select('svg').attr('height');
            const simulation = d3.forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(-250))
                .force('link', d3.forceLink(links).id(d => d.id).distance(100))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('x', d3.forceX())
                .force('y', d3.forceY())

            const svg = d3.select('svg')
                .call(d3.zoom().on('zoom', (e) => {
                    svg
                        .selectAll('circle')
                        .attr('transform', e.transform);
                    svg
                        .selectAll('line')
                        .attr('transform', e.transform);
                    svg
                        .selectAll('text')
                        .attr('transform', e.transform);
                }))

            const defs = svg
                .append('defs')
                .selectAll('marker')
                .data(['node'])
                .enter()
                .append('marker')
                .attr('id', 'arrow')
                .attr('viewBox', '0 -2.5 5 5')
                .attr('refX', 8)
                .attr('refY', 0)
                .attr('markerWidth', 15)
                .attr('markerHeight', 15)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-1.5L5,0L0,1.5')
                .attr('fill', '#A9A9A9')

            const lines = svg
                .append('g')
                .attr('class', 'link')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('stroke', '#A9A9A9')
                .attr('marker-end', 'url(#arrow)')

            // TODO style circles
            const circles = svg
                .append('g')
                .attr('class', 'node')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('r', 8)
                .on('mouseover', function (event, d) {
                    const node = d3.select(this);
                    svg
                        .append('text')
                        .attr('id', d.id.replace(/[\s\/]/g, ''))
                        .attr('x', node.attr('cx') + 15)
                        .attr('y', node.attr('cy') + 15)
                        .attr('transform', node.attr('transform'))
                        .attr('fill', 'blue')
                        .text(d.id);
                })
                .on('mouseout', function (event, d) {
                    d3.select('#' + d.id.replace(/[\s\/]/g, '')).remove();
                })

            // TODO add hover for text
            simulation.on('tick', () => {
                circles
                    .attr('cx', (node) => node.x)
                    .attr('cy', (node) => node.y);
                lines
                    .attr('x1', (link) => link.source.x)
                    .attr('y1', (link) => link.source.y)
                    .attr('x2', (link) => link.target.x)
                    .attr('y2', (link) => link.target.y)
            });
            return svg.node();
        })
    });
