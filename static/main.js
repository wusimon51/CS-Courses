// removes forward slashes and ampersands for querySelector() to work
function normalizeSelector(selector) {
    return selector.replace(/[\s\/&]/g, '');
}

// add labels on hover
function addLabels(className) {
    const svg = d3.select('svg');
    let node = svg.select('#' + className)
    svg
        .append('text')
        .attr('class', 'secondary-label')
        .attr('x', parseFloat(node.attr('cx')) + 8)
        .attr('y', parseFloat(node.attr('cy')) - 8)
        .attr('transform', node.attr('transform'))
        .attr('fill', '#211103')
        .style('pointer-events', 'none')
        .style('text-shadow', '0px 0px 2px white')
        .style('font-family', 'Helvetica')
        .text(node.data()[0].id);
}

fetch('/data')
    .then(function (response) {
        response.json().then((courseMap) => {
            // create arrays for force simulation
            const nodes = courseMap.nodes.map(node => Object.create(node));
            const links = courseMap.links.map(link => Object.create(link));
            // svg dimensions
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;
            const simulation = d3.forceSimulation(nodes)
                .force('charge', d3.forceManyBody().strength(-250))
                .force('link', d3.forceLink(links).id(d => d.id).distance(100))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('x', d3.forceX())
                .force('y', d3.forceY());

            // transformations for zooming and panning
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

            // create arrowhead for end of lines
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
                .attr('fill', '#C3BABA');

            svg.select('defs')
                .append('marker')
                .attr('id', 'blue-arrow')
                .attr('viewBox', '0 -2.5 5 5')
                .attr('refX', 7)
                .attr('refY', 0)
                .attr('markerWidth', 15)
                .attr('markerHeight', 15)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-1.5L5,0L0,1.5')
                .attr('fill', '#06BEE1');

            svg.select('defs')
                .append('marker')
                .attr('id', 'red-arrow')
                .attr('viewBox', '0 -2.5 5 5')
                .attr('refX', 7)
                .attr('refY', 0)
                .attr('markerWidth', 15)
                .attr('markerHeight', 15)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-1.5L5,0L0,1.5')
                .attr('fill', '#D62246');

            // lines definition
            const lines = svg
                .append('g')
                .attr('class', 'link')
                .selectAll('line')
                .data(links)
                .enter()
                .append('line')
                .attr('class', (d) => `link-source-${normalizeSelector(d.source.id)} link-target-${normalizeSelector(d.target.id)}`)
                .attr('stroke', '#C3BABA')
                .attr('marker-end', 'url(#arrow)');

            // circles definition
            const circles = svg
                .append('g')
                .attr('class', 'node')
                .selectAll('circle')
                .data(nodes)
                .enter()
                .append('circle')
                .attr('id', (d) => normalizeSelector(d.id))
                .attr('r', 8)
                .attr('fill', 'gray')
                .on('mouseover', function (event, d) {
                    const node = d3.select(this);
                    // append text to node being hovered
                    svg
                        .append('text')
                        .attr('id', 'label-' + normalizeSelector(d.id))
                        .attr('x', parseFloat(node.attr('cx')) + 8)
                        .attr('y', parseFloat(node.attr('cy')) - 8)
                        .attr('transform', node.attr('transform'))
                        .attr('fill', '#211103')
                        .style('pointer-events', 'none')
                        .style('font-family', 'Helvetica')
                        .text(d.id);
                    // append text to source nodes
                    let sourceLinks = svg.selectAll('.link-target-' + normalizeSelector(d.id));
                    sourceLinks
                        .attr('stroke', '#D62246')
                        .attr('marker-end', 'url(#red-arrow)');
                    sourceLinks.each(function () {
                        let sourceLink = d3.select(this);
                        const sourceClass = sourceLink.attr('class').split(' ').map((className) => className.replace(/.+-/, ''))[0];
                        addLabels(sourceClass);
                    });
                    // append text to target nodes
                    let targetLinks = svg.selectAll('.link-source-' + normalizeSelector(d.id));
                    targetLinks
                        .attr('stroke', '#06BEE1')
                        .attr('marker-end', 'url(#blue-arrow)');
                    targetLinks.each(function () {
                        let targetLink = d3.select(this);
                        const targetClass = targetLink.attr('class').split(' ').map((className) => className.replace(/.+-/, ''))[1];
                        addLabels(targetClass);
                    });
                })
                .on('mouseout', function (event, d) {
                    d3.select('#' + 'label-' + normalizeSelector(d.id)).remove();
                    svg.selectAll('.link-target-' + normalizeSelector(d.id))
                        .attr('stroke', '#C3BABA')
                        .attr('marker-end', 'url(#arrow)');
                    svg.selectAll('.secondary-label').remove();
                    svg.selectAll('.link-source-' + normalizeSelector(d.id))
                        .attr('stroke', '#C3BABA')
                        .attr('marker-end', 'url(#arrow)');
                });

            // run force simulation on nodes and links
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
        })
    })