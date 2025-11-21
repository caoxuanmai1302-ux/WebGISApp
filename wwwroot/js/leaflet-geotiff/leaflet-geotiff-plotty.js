L.LeafletGeotiff.Plotty = L.LeafletGeotiffRenderer.extend({
    initialize: function (options) {
        this.options = options || {};
        this.colorScale = this.options.colorScale || "viridis";
        this.clampLow = this.options.clampLow || false;
        this.clampHigh = this.options.clampHigh || false;
    },
    render: function (raster, canvas, ctx, args) {
        var data = raster.data,
            width = raster.width,
            height = raster.height;

        canvas.width = width;
        canvas.height = height;

        var imageData = ctx.createImageData(width, height);
        var arr = imageData.data;

        var min = this.clampLow ? 0 : Math.min(...data);
        var max = this.clampHigh ? 1 : Math.max(...data);

        for (var i = 0; i < data.length; i++) {
            var v = data[i];

            // Normalize 0–1
            var t = (v - min) / (max - min);
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            // Convert NDVI → Color
            var c = plotty.colorScales[this.colorScale](t);

            arr[4 * i + 0] = c[0];
            arr[4 * i + 1] = c[1];
            arr[4 * i + 2] = c[2];
            arr[4 * i + 3] = 180; // alpha
        }

        ctx.putImageData(imageData, 0, 0);
    }
});
