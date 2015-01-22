(function () {
    window.cdat = window.cdat || {};
    var app = window.cdat;

    function renderVariables(connection, filename, variables) {
        // element containing the list of variables
        var el = $('.vtk-variable-browser').empty();

        // element containing info about the selected variable
        var vl = $('.vtk-variable-info').empty();

        $('.vtk-variable-current-file').text(filename);

        var vlist;
        if (variables) {
            vlist = $('<ul/>');
            _.each(variables, function (info, vname) {
                var li = $('<li/>');
                li.text(vname);
                vlist.append(li);
            });
        } else {
            vlist = $('<p>');
            vlist.text('Cannot read "' + filename + '".');
        }

        el.append(vlist);
    }

    function renderBrowser(connection, files) {
        el = $('.vtk-file-browser');

        function setMaxHeight() {
            var h = $(window).height();
            el.css({
                'max-height': (h - el.offset().top - 50)
            });

        }
        $(window).resize(setMaxHeight);
        setMaxHeight();

        function makeDraggable(node) {
            if (node.type === 'variable') {
                var v = $(this);
                v.draggable({
                    helper: 'clone',
                    appendTo: 'body',
                    scope: 'variable',
                    zIndex: 1000
                });

                v.find('.node-label').addClass('btn btn-primary');
            } else {
                $(this).tooltip({
                    placement: 'right',
                    delay: {
                        show: 100,
                        hide: 0
                    },
                    title: node.text,
                    container: 'body'
                });
            }
        }

        function cleanup(node) {
            if (node.type === 'variable') {
                $(this).draggable('destroy');
            } else {
                $(this).tooltip('destroy');
            }
        }

        el.treeview({data: files, showTags: true, oncreate: makeDraggable, ondestroy: cleanup})
            .find('li.list-group-item')
            .filter(function () {
                return $(this).data('node').type === 'variable';
            })
            .draggable();

        /*
        .bind('file-click',/* directory-click directory-not-found file-group-click'* / function (e) {
            // e.type, e.name, e.path, e.relativePathList

            if (e.relativePathList) {
                connection.session
                    .call('file.server.info', e.relativePathList)
                    .then(function (info) {
                        var filename = e.relativePathList[0].split('/').slice(1).join('/');
                        info = info || {variables: null};
                        renderVariables(connection, filename, info.variables);
                    });
            }

        });
        */
    }

    app.main = function (connection) {
        // default!?
    };

    app.error = function (err) {
        // TODO: create general error page
        var msg;
        try {
            msg = JSON.stringify(err, null, 2);
        } catch (e) {
            msg = err;
        }
        console.error(msg);
    };

    app.variables = function () {
        // list all variables in the given file

    };

    app.browser = function (connection) {
        // connect the vtkweb file browser widget
        connection.session
            .call('file.server.list')
            .then(function (files) {
                renderBrowser(connection, files);
            }, app.error);
    };
})();
