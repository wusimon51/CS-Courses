function normalizeSelector(selector) {
    return selector.replace(/[\s\/&]/g, '');
}

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
                .force('y', d3.forceY());

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
                }));

            const defs = svg
                .append('defs')
                .selectAll('marker')
                .data(['node'])
                .enter()
                .append('marker')
                .attr('id', 'arrow')
                .attr('viewBox', '0 -2.5 5 5')
                .attr('refX', 7)
                .attr('refY', 0)
                .attr('markerWidth', 15)
                .attr('markerHeight', 15)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-1.5L5,0L0,1.5')
                .attr('fill', '#A9A9A9');

            // TODO add source node and outgoing node tooltips to hover
            const lines = svg
                .append('g')
                .attr('class', 'link')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('class', (d) => `link-source-${normalizeSelector(d.source.id)} link-target-${normalizeSelector(d.target.id)}`)
                .attr('stroke', '#A9A9A9')
                .attr('marker-end', 'url(#arrow)');

            // TODO style circles
            const circles = svg
                .append('g')
                .attr('class', 'node')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('id', (d) => normalizeSelector(d.id))
                .attr('r', 8)
                .on('mouseover', function (event, d) {
                    const node = d3.select(this);
                    svg
                        .append('text')
                        .attr('id', 'label-' + normalizeSelector(d.id))
                        .attr('x', parseFloat(node.attr('cx')) + 8)
                        .attr('y', parseFloat(node.attr('cy')) - 8)
                        .attr('transform', node.attr('transform'))
                        .attr('fill', 'blue')
                        .style('pointer-events', 'none')
                        .text(d.id);
                    let links = svg.selectAll('.link-target-' + normalizeSelector(d.id));
                        links.attr('stroke', 'red')
                        links.each(function () {
                            let link = d3.select(this);
                            const sourceClass = link.attr('class').split(' ').map((className) => className.replace(/.+-/, ''))[0];
                            let sourceNode = svg.select('#' + sourceClass)
                            svg
                                .append('text')
                                .attr('class', 'secondary-label')
                                .attr('x', parseFloat(sourceNode.attr('cx')) + 8)
                                .attr('y', parseFloat(sourceNode.attr('cy')) - 8)
                                .attr('transform', sourceNode.attr('transform'))
                                .attr('fill', 'blue')
                                .style('pointer-events', 'none')
                                .text(sourceNode.data()[0].id);
                    })

                })
                .on('mouseout', function (event, d) {
                    d3.select('#' + 'label-' + normalizeSelector(d.id)).remove();
                    svg.selectAll('.link-target-' + normalizeSelector(d.id))
                        .attr('stroke', '#A9A9A9')
                    svg.selectAll('.secondary-label').remove();
                });

            simulation.on('tick', () => {
                circles
                    .attr('cx', (node) => node.x)
                    .attr('cy', (node) => node.y);
                lines
                    .attr('x1', (link) => link.source.x)
                    .attr('y1', (link) => link.source.y)
                    .attr('x2', (link) => link.target.x)
                    .attr('y2', (link) => link.target.y);
            });
            return svg.node();
        })
    });
