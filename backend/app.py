import flask
import os
import pathlib
import waitress
from werkzeug.routing import BaseConverter


DIRPATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DISTPATH = f"{DIRPATH}/dist"


app = flask.Flask(
    __name__,
    static_folder=f"{DISTPATH}/static",
    template_folder=DISTPATH)


class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


app.url_map.converters["regex"] = RegexConverter


@app.route(r'/<regex(".*[.][a-zA-Z0-9]{2,4}$"):path>')
def file_route(path):
    file_path = f"{DISTPATH}/{path}"
    if (
            os.path.isfile(file_path)
            and pathlib.Path(DISTPATH) in pathlib.Path(file_path).parents
    ):
        return flask.send_file(file_path)
    else:
        return flask.send_file(f"{DISTPATH}/index.html"), 404


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    return flask.send_file(f"{DISTPATH}/index.html")


@app.errorhandler(404)
def page_not_found(message):
    return flask.send_file(f"{DISTPATH}/index.html"), 404


if __name__ == '__main__':
    waitress.serve(app, listen='*:5001')
