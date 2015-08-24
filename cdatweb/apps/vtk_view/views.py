import json
import vtk_launcher
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from search import files

_browser_help = (
    "Choose a variable from the list of files available on the server "
    "and drag it to the canvas."
)


def _refresh(request):
    """Refresh the visualization session information."""
    # check the session for a vtkweb instance
    vis = request.session.get('vtkweb')

    if vis is None or vtk_launcher.status(vis.get('id', '')) is None:
        # open a visualization instance
        vis = vtk_launcher.new_instance()
        request.session['vtkweb'] = vis

    return dict(vis)


def vtk_viewer(request):
    """Open the main visualizer view."""
    return render(
        request,
        'vtk_view/cdat_viewer.html'
    )


def vtk_test(request, test="cone"):
    return render(request, 'vtk_view/view_test.html', {"test": test})


@csrf_exempt  # should probably fix this at some point
def vtkweb_launcher(request):
    """Proxy requests to the configured launcher service."""
    import requests
    try:
        from local_settings import VISUALIZATION_LAUNCHER
    except ImportError:
        VISUALIZATION_LAUNCHER = 'http://aims1.llnl.gov/vtk'

    if not VISUALIZATION_LAUNCHER:
        # unconfigured launcher
        return HttpResponse(status=404)

    # TODO: add status and delete methods
    if request.method == 'POST':
        req = requests.post(VISUALIZATION_LAUNCHER, request.body)
        if req.ok:
            return HttpResponse(req.content)
        else:
            return HttpResponse(status=500)

    return HttpResponse(status=404)


@csrf_exempt
def search(request):
    try:
        results = {}
        inputstring = request.POST.get('query')
        context = json.loads(inputstring)

        host = context["host"]
        print host
        query = {}
        if context["text"]:
            query["query"] = context["text"]
        if context["project"]:
            query["project"] = context["project"]
        if context["limit"]:
            query["limit"] = context["limit"]
        if context["offset"]:
            query["offset"] = context["offset"]
        # query['fields'] = 'size,timestamp,project,id,experiment,title,url'

        try:
            results['data'] = files(host, query)
        except Exception:
            results['data'] = "failed to reach node"
            print "failed to reach node"
    except Exception:
        results['data'] = "failed to parse json"
        print "failed to parse json"

    return HttpResponse(json.dumps(results))
