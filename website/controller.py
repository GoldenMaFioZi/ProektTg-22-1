# controller.py
from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_user, current_user, login_required
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import login_manager, db
from model import User, Product  # больше не используем относительный импорт

ctrl = Blueprint('main', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@ctrl.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        item_dict = request.form.to_dict()
        for key in item_dict:
            new_product = Product(type=key, user_id=current_user.id)
            db.session.add(new_product)
            db.session.commit()
            flash(f"Товар '{key}' добавлен в заказ", category='success')
    return render_template("home.html", user=current_user)


@ctrl.route('/sign', methods=['GET', 'POST'])
def sign():
    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email уже зарегистрирован', category='error')
        else:
            new_user = User(email=email, name=name, password=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            flash('Успешная регистрация!', category='success')
            return redirect(url_for('main.home'))

    return render_template('sign_up.html', user=current_user)


@ctrl.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                flash('Вход выполнен!', category='success')
                login_user(user, remember=True)
                return redirect(url_for('main.home'))
            else:
                flash('Неверный пароль', category='error')
        else:
            flash('Email не найден', category='error')

    return render_template('login.html', user=current_user)


@ctrl.route('/orders')
@login_required
def orders():
    user_orders = current_user.products
    return render_template('orders.html', user=current_user, user_orders=user_orders)
